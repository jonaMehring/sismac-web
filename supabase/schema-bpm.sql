-- ============================================================
-- SISMAC — Schema BPM: Procesos, Tareas y Comentarios
-- ============================================================

-- ============================================================
-- ETIQUETAS DE TAREAS
-- ============================================================
CREATE TABLE IF NOT EXISTS task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLANTILLAS DE PROCESOS (proceso reutilizable)
-- ============================================================
CREATE TABLE IF NOT EXISTS process_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT CHECK (categoria IN ('mantenimiento', 'administrativo', 'compliance', 'ventas', 'otro')),
  version INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Etapas de una plantilla
CREATE TABLE IF NOT EXISTS process_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES process_templates(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL,
  duracion_estimada_horas INTEGER,
  rol_responsable TEXT CHECK (rol_responsable IN ('admin_sismac', 'admin_financiero', 'supervisor_bpm', 'operario', 'cliente')),
  es_opcional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROCESOS (instancia de una plantilla en ejecución)
-- ============================================================
CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES process_templates(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'activo'
    CHECK (estado IN ('activo', 'pausado', 'completado', 'cancelado')),
  prioridad TEXT NOT NULL DEFAULT 'normal'
    CHECK (prioridad IN ('baja', 'normal', 'alta', 'critica')),
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_limite DATE,
  completado_en TIMESTAMPTZ,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TAREAS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES process_stages(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_curso', 'en_revision', 'completada', 'cancelada', 'demorada')),
  prioridad TEXT NOT NULL DEFAULT 'normal'
    CHECK (prioridad IN ('baja', 'normal', 'alta', 'critica')),
  asignado_a UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  fecha_limite TIMESTAMPTZ,
  completada_en TIMESTAMPTZ,
  estimacion_horas DECIMAL(5,2),
  horas_reales DECIMAL(5,2),
  orden INTEGER DEFAULT 0,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asignaciones de etiquetas a tareas
CREATE TABLE IF NOT EXISTS task_tag_assignments (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES task_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ============================================================
-- COMENTARIOS (INMUTABLES — solo INSERT, nunca UPDATE/DELETE)
-- ============================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES usuarios(id),
  contenido TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'comentario'
    CHECK (tipo IN ('comentario', 'cambio_estado', 'asignacion', 'sistema')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- SIN updated_at: inmutable por diseño
);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER trg_process_templates_updated_at BEFORE UPDATE ON process_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_processes_updated_at BEFORE UPDATE ON processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: registrar cambio de estado de tarea en comentarios
CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO task_comments (task_id, autor_id, contenido, tipo, metadata)
    VALUES (
      NEW.id,
      auth.uid(),
      'Estado cambiado de "' || OLD.estado || '" a "' || NEW.estado || '"',
      'cambio_estado',
      jsonb_build_object('estado_anterior', OLD.estado, 'estado_nuevo', NEW.estado)
    );
  END IF;
  IF OLD.asignado_a IS DISTINCT FROM NEW.asignado_a THEN
    INSERT INTO task_comments (task_id, autor_id, contenido, tipo, metadata)
    VALUES (
      NEW.id,
      auth.uid(),
      'Tarea reasignada',
      'asignacion',
      jsonb_build_object('asignado_anterior', OLD.asignado_a, 'asignado_nuevo', NEW.asignado_a)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_task_status_change AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_status_change();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Plantillas: todos leen, solo admin/supervisor crean
CREATE POLICY "process_templates_select" ON process_templates FOR SELECT
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm', 'operario'));
CREATE POLICY "process_templates_admin" ON process_templates FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));

-- Procesos
CREATE POLICY "processes_select" ON processes FOR SELECT
  USING (
    get_user_rol() IN ('admin_sismac', 'supervisor_bpm') OR
    creado_por = auth.uid() OR
    cliente_id IN (SELECT cliente_id FROM cliente_operarios WHERE usuario_id = auth.uid() AND activo = true)
  );
CREATE POLICY "processes_insert" ON processes FOR INSERT
  WITH CHECK (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));
CREATE POLICY "processes_update" ON processes FOR UPDATE
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));

-- Tareas: cada usuario ve las suyas + las de sus procesos
CREATE POLICY "tasks_select" ON tasks FOR SELECT
  USING (
    get_user_rol() IN ('admin_sismac', 'supervisor_bpm') OR
    asignado_a = auth.uid() OR
    creado_por = auth.uid()
  );
CREATE POLICY "tasks_insert" ON tasks FOR INSERT
  WITH CHECK (get_user_rol() IN ('admin_sismac', 'supervisor_bpm', 'operario'));
CREATE POLICY "tasks_update" ON tasks FOR UPDATE
  USING (
    get_user_rol() IN ('admin_sismac', 'supervisor_bpm') OR
    asignado_a = auth.uid()
  );
CREATE POLICY "tasks_delete" ON tasks FOR DELETE
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));

-- Comentarios: solo INSERT (inmutables), todos los involucrados pueden leer
CREATE POLICY "task_comments_select" ON task_comments FOR SELECT
  USING (
    get_user_rol() IN ('admin_sismac', 'supervisor_bpm') OR
    task_id IN (
      SELECT id FROM tasks WHERE asignado_a = auth.uid() OR creado_por = auth.uid()
    )
  );
CREATE POLICY "task_comments_insert" ON task_comments FOR INSERT
  WITH CHECK (autor_id = auth.uid() OR get_user_rol() = 'admin_sismac');
-- NO hay políticas de UPDATE ni DELETE para task_comments → son inmutables

-- Tags: todos pueden leer, solo admin puede crear
CREATE POLICY "task_tags_select" ON task_tags FOR SELECT USING (true);
CREATE POLICY "task_tags_admin" ON task_tags FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_asignado ON tasks(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tasks_estado ON tasks(estado);
CREATE INDEX IF NOT EXISTS idx_tasks_process ON tasks(process_id);
CREATE INDEX IF NOT EXISTS idx_tasks_fecha_limite ON tasks(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_processes_cliente ON processes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_processes_estado ON processes(estado);
