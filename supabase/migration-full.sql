-- ============================================================
-- SISMAC — Schema Core: Usuarios, Roles y Clientes
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT,
  rol TEXT NOT NULL DEFAULT 'operario'
    CHECK (rol IN ('admin_sismac', 'admin_financiero', 'supervisor_bpm', 'operario', 'cliente')),
  avatar_url TEXT,
  telefono TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permisos granulares por módulo (para extensión futura)
CREATE TABLE IF NOT EXISTS permisos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL CHECK (modulo IN ('bpm', 'financiero', 'compliance', 'admin')),
  puede_leer BOOLEAN NOT NULL DEFAULT true,
  puede_escribir BOOLEAN NOT NULL DEFAULT false,
  puede_eliminar BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, modulo)
);

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  razon_social TEXT,
  cuit TEXT UNIQUE,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  localidad TEXT,
  provincia TEXT DEFAULT 'Buenos Aires',
  contacto_nombre TEXT,
  contacto_email TEXT,
  contacto_telefono TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sectores/Plantas de un cliente
CREATE TABLE IF NOT EXISTS sectores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  ubicacion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipos/Maquinaria por sector
CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID NOT NULL REFERENCES sectores(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  modelo TEXT,
  marca TEXT,
  numero_serie TEXT,
  numero_activo TEXT,
  año_fabricacion INTEGER,
  estado TEXT NOT NULL DEFAULT 'operativo'
    CHECK (estado IN ('operativo', 'mantenimiento', 'fuera_servicio', 'baja')),
  proxima_revision DATE,
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación operarios asignados a clientes
CREATE TABLE IF NOT EXISTS cliente_operarios (
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_asignacion DATE DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (cliente_id, usuario_id)
);

-- ============================================================
-- FUNCIÓN updated_at AUTOMÁTICO
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sectores_updated_at BEFORE UPDATE ON sectores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_equipos_updated_at BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCIÓN: Crear perfil de usuario al registrarse en Auth
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'operario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_operarios ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS TEXT AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Usuarios: cada usuario ve su propio perfil; admins ven todos
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT
  USING (id = auth.uid() OR get_user_rol() IN ('admin_sismac'));

CREATE POLICY "usuarios_update_own" ON usuarios FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "usuarios_admin" ON usuarios FOR ALL
  USING (get_user_rol() = 'admin_sismac');

-- Clientes: operarios ven los clientes asignados; admins ven todos
CREATE POLICY "clientes_admin" ON clientes FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero', 'supervisor_bpm'));

CREATE POLICY "clientes_operario" ON clientes FOR SELECT
  USING (
    get_user_rol() = 'operario' AND
    id IN (SELECT cliente_id FROM cliente_operarios WHERE usuario_id = auth.uid() AND activo = true)
  );

CREATE POLICY "clientes_self" ON clientes FOR SELECT
  USING (
    get_user_rol() = 'cliente' AND
    id IN (SELECT cliente_id FROM cliente_operarios WHERE usuario_id = auth.uid() AND activo = true)
  );

-- Sectores y equipos heredan política de clientes
CREATE POLICY "sectores_select" ON sectores FOR SELECT
  USING (
    get_user_rol() IN ('admin_sismac', 'admin_financiero', 'supervisor_bpm') OR
    cliente_id IN (SELECT cliente_id FROM cliente_operarios WHERE usuario_id = auth.uid() AND activo = true)
  );
CREATE POLICY "sectores_admin" ON sectores FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));

CREATE POLICY "equipos_select" ON equipos FOR SELECT
  USING (
    get_user_rol() IN ('admin_sismac', 'admin_financiero', 'supervisor_bpm') OR
    sector_id IN (
      SELECT s.id FROM sectores s
      JOIN cliente_operarios co ON co.cliente_id = s.cliente_id
      WHERE co.usuario_id = auth.uid() AND co.activo = true
    )
  );
CREATE POLICY "equipos_admin" ON equipos FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_sectores_cliente ON sectores(cliente_id);
CREATE INDEX IF NOT EXISTS idx_equipos_sector ON equipos(sector_id);
CREATE INDEX IF NOT EXISTS idx_cliente_operarios_usuario ON cliente_operarios(usuario_id);
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
-- ============================================================
-- SISMAC — Schema Financiero: Gastos, Facturas, Presupuestos
-- ============================================================

-- ============================================================
-- PROVEEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  razon_social TEXT,
  cuit TEXT UNIQUE,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  condicion_fiscal TEXT CHECK (condicion_fiscal IN ('responsable_inscripto', 'monotributo', 'exento', 'consumidor_final')),
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATEGORÍAS DE GASTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  color TEXT DEFAULT '#6B7280',
  icono TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CENTROS DE COSTO
-- ============================================================
CREATE TABLE IF NOT EXISTS cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  responsable_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GASTOS OPERATIVOS
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion TEXT NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  tipo_cambio DECIMAL(10,4) DEFAULT 1,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID NOT NULL REFERENCES expense_categories(id),
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  proceso_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro')),
  numero_comprobante TEXT,
  archivo_url TEXT,
  notas TEXT,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  aprobado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  aprobado_en TIMESTAMPTZ,
  estado TEXT NOT NULL DEFAULT 'registrado'
    CHECK (estado IN ('registrado', 'aprobado', 'rechazado')),
  motivo_rechazo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FACTURAS EMITIDAS
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'B' CHECK (tipo IN ('A', 'B', 'C', 'X', 'E')),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  descripcion TEXT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  iva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  iva_monto DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'emitida', 'enviada', 'cobrada', 'vencida', 'anulada')),
  fecha_cobro DATE,
  metodo_cobro TEXT CHECK (metodo_cobro IN ('transferencia', 'cheque', 'efectivo', 'tarjeta', 'otro')),
  notas TEXT,
  condiciones_pago TEXT,
  archivo_url TEXT,
  motivo_anulacion TEXT,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ítems de factura
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  unidad TEXT DEFAULT 'unidad',
  cantidad DECIMAL(10,3) NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  proceso_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRESUPUESTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  proceso_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'enviado', 'aprobado', 'rechazado', 'vencido', 'convertido')),
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_validez DATE,
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  iva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  iva_monto DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  version_actual INTEGER NOT NULL DEFAULT 1,
  notas TEXT,
  condiciones TEXT,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  aprobado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_aprobacion TIMESTAMPTZ,
  motivo_rechazo TEXT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Versiones de presupuesto (historial inmutable de cambios)
CREATE TABLE IF NOT EXISTS budget_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  version_numero INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  cambios TEXT,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(budget_id, version_numero)
);

-- Ítems de presupuesto
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  unidad TEXT DEFAULT 'unidad',
  cantidad DECIMAL(10,3) NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN: Numerar facturas automáticamente
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS budget_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'FAC-' || LPAD(nextval('invoice_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_budget_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PRES-' || LPAD(nextval('budget_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Crear snapshot de versión al modificar presupuesto
-- ============================================================
CREATE OR REPLACE FUNCTION snapshot_budget_on_update()
RETURNS TRIGGER AS $$
DECLARE
  items_json JSONB;
BEGIN
  IF OLD.estado = NEW.estado AND
     OLD.subtotal = NEW.subtotal AND
     OLD.total = NEW.total AND
     OLD.titulo = NEW.titulo THEN
    RETURN NEW;
  END IF;

  SELECT jsonb_agg(row_to_json(bi)) INTO items_json
  FROM budget_items bi WHERE bi.budget_id = OLD.id;

  INSERT INTO budget_versions (budget_id, version_numero, snapshot, cambios, creado_por)
  VALUES (
    OLD.id,
    OLD.version_actual,
    jsonb_build_object(
      'budget', row_to_json(OLD),
      'items', COALESCE(items_json, '[]'::JSONB)
    ),
    'Versión ' || OLD.version_actual || ' guardada automáticamente',
    auth.uid()
  )
  ON CONFLICT (budget_id, version_numero) DO NOTHING;

  NEW.version_actual = OLD.version_actual + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_budget_snapshot BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION snapshot_budget_on_update();

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
CREATE TRIGGER trg_proveedores_updated_at BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Módulo financiero: admin_sismac y admin_financiero
CREATE POLICY "finance_admin_full" ON proveedores FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));
CREATE POLICY "finance_categories_read" ON expense_categories FOR SELECT USING (true);
CREATE POLICY "finance_categories_admin" ON expense_categories FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));
CREATE POLICY "cost_centers_read" ON cost_centers FOR SELECT
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero', 'supervisor_bpm'));
CREATE POLICY "cost_centers_admin" ON cost_centers FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));

CREATE POLICY "expenses_admin" ON expenses FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));
CREATE POLICY "expenses_own" ON expenses FOR SELECT
  USING (creado_por = auth.uid());
CREATE POLICY "expenses_create_operario" ON expenses FOR INSERT
  WITH CHECK (get_user_rol() IN ('admin_sismac', 'admin_financiero', 'supervisor_bpm', 'operario'));

CREATE POLICY "invoices_admin" ON invoices FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));
CREATE POLICY "invoice_items_admin" ON invoice_items FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));

CREATE POLICY "budgets_admin" ON budgets FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));
CREATE POLICY "budgets_supervisor_read" ON budgets FOR SELECT
  USING (get_user_rol() = 'supervisor_bpm');
CREATE POLICY "budget_versions_admin" ON budget_versions FOR SELECT
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));
CREATE POLICY "budget_items_admin" ON budget_items FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'admin_financiero'));

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_expenses_fecha ON expenses(fecha);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_cliente ON expenses(cliente_id);
CREATE INDEX IF NOT EXISTS idx_expenses_estado ON expenses(estado);
CREATE INDEX IF NOT EXISTS idx_invoices_cliente ON invoices(cliente_id);
CREATE INDEX IF NOT EXISTS idx_invoices_estado ON invoices(estado);
CREATE INDEX IF NOT EXISTS idx_invoices_vencimiento ON invoices(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_budgets_cliente ON budgets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_budgets_estado ON budgets(estado);
-- ============================================================
-- SISMAC — Schema Compliance: Documentos y Vencimientos
-- ============================================================

-- ============================================================
-- TIPOS DE DOCUMENTOS (catálogo configurable)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  alerta_dias_30 BOOLEAN NOT NULL DEFAULT true,
  alerta_dias_15 BOOLEAN NOT NULL DEFAULT true,
  alerta_dias_7 BOOLEAN NOT NULL DEFAULT true,
  alerta_dias_1 BOOLEAN NOT NULL DEFAULT true,
  obligatorio BOOLEAN NOT NULL DEFAULT true,
  aplica_a TEXT NOT NULL DEFAULT 'empresa'
    CHECK (aplica_a IN ('empresa', 'persona', 'equipo')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTOS DE CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  nombre_archivo TEXT NOT NULL,
  archivo_url TEXT NOT NULL,
  fecha_emision DATE,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'vigente'
    CHECK (estado IN ('vigente', 'por_vencer', 'vencido', 'renovado', 'pendiente_aprobacion')),
  notas TEXT,
  numero_documento TEXT,
  organismo_emisor TEXT,
  cargado_por UUID NOT NULL REFERENCES usuarios(id),
  aprobado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  aprobado_en TIMESTAMPTZ,
  reemplaza_a UUID REFERENCES client_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENTRADAS CONSUMAN (historial de intervenciones por cliente)
-- ============================================================
CREATE TABLE IF NOT EXISTS consuman_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
  sector_id UUID REFERENCES sectores(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'mantenimiento_preventivo',
    'mantenimiento_correctivo',
    'inspeccion',
    'certificacion',
    'reemplazo',
    'capacitacion',
    'incidente',
    'otro'
  )),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  proxima_revision DATE,
  realizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  costo DECIMAL(12,2),
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  archivo_url TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN: Actualizar estados de vencimiento (pg_cron diario)
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_update_vencimientos()
RETURNS void AS $$
BEGIN
  -- Documentos vencidos
  UPDATE client_documents
  SET estado = 'vencido'
  WHERE estado IN ('vigente', 'por_vencer')
    AND fecha_vencimiento < CURRENT_DATE;

  -- Documentos "por vencer" (próximos 30 días)
  UPDATE client_documents
  SET estado = 'por_vencer'
  WHERE estado = 'vigente'
    AND fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';

  -- Facturas vencidas
  UPDATE invoices
  SET estado = 'vencida'
  WHERE estado IN ('emitida', 'enviada')
    AND fecha_vencimiento < CURRENT_DATE;

  -- Tareas demoradas
  UPDATE tasks
  SET estado = 'demorada'
  WHERE estado IN ('pendiente', 'en_curso')
    AND fecha_limite < NOW();

  -- Presupuestos vencidos (fecha_validez pasada)
  UPDATE budgets
  SET estado = 'vencido'
  WHERE estado IN ('enviado')
    AND fecha_validez IS NOT NULL
    AND fecha_validez < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER trg_document_types_updated_at BEFORE UPDATE ON document_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_client_documents_updated_at BEFORE UPDATE ON client_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_consuman_entries_updated_at BEFORE UPDATE ON consuman_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consuman_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_types_read" ON document_types FOR SELECT USING (true);
CREATE POLICY "document_types_admin" ON document_types FOR ALL
  USING (get_user_rol() = 'admin_sismac');

CREATE POLICY "client_documents_admin" ON client_documents FOR ALL
  USING (get_user_rol() = 'admin_sismac');
CREATE POLICY "client_documents_supervisor_read" ON client_documents FOR SELECT
  USING (get_user_rol() IN ('supervisor_bpm', 'admin_financiero'));
CREATE POLICY "client_documents_own_client" ON client_documents FOR SELECT
  USING (
    get_user_rol() = 'cliente' AND
    cliente_id IN (SELECT cliente_id FROM cliente_operarios WHERE usuario_id = auth.uid() AND activo = true)
  );
CREATE POLICY "client_documents_operario_upload" ON client_documents FOR INSERT
  WITH CHECK (
    get_user_rol() IN ('admin_sismac', 'operario') AND
    cargado_por = auth.uid()
  );

CREATE POLICY "consuman_entries_admin" ON consuman_entries FOR ALL
  USING (get_user_rol() IN ('admin_sismac', 'supervisor_bpm'));
CREATE POLICY "consuman_entries_operario" ON consuman_entries FOR SELECT
  USING (
    realizado_por = auth.uid() OR
    cliente_id IN (SELECT cliente_id FROM cliente_operarios WHERE usuario_id = auth.uid() AND activo = true)
  );

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_client_documents_cliente ON client_documents(cliente_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_vencimiento ON client_documents(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_client_documents_estado ON client_documents(estado);
CREATE INDEX IF NOT EXISTS idx_consuman_entries_cliente ON consuman_entries(cliente_id);
CREATE INDEX IF NOT EXISTS idx_consuman_entries_fecha ON consuman_entries(fecha);
-- ============================================================
-- SISMAC — Schema Audit: Trazabilidad y Notificaciones
-- ============================================================

-- ============================================================
-- AUDIT LOG (INMUTABLE — solo INSERT)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'VIEW', 'APPROVE', 'REJECT')),
  tabla TEXT NOT NULL,
  registro_id TEXT,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- SIN updated_at — este registro NUNCA se modifica
);

-- ============================================================
-- NOTIFICACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'documento_por_vencer',
    'documento_vencido',
    'tarea_asignada',
    'tarea_demorada',
    'factura_por_vencer',
    'factura_vencida',
    'presupuesto_aprobado',
    'presupuesto_rechazado',
    'gasto_aprobado',
    'gasto_rechazado',
    'proceso_completado',
    'comentario_nuevo',
    'sistema'
  )),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  accion_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  leida_en TIMESTAMPTZ
);

-- ============================================================
-- FUNCIÓN: Trigger de auditoría genérico
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (usuario_id, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::JSONB ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::JSONB ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_budgets AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_client_documents AFTER INSERT OR UPDATE OR DELETE ON client_documents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- ============================================================
-- FUNCIÓN: Generar alertas diarias (pg_cron 07:00 ARS)
-- ============================================================
CREATE OR REPLACE FUNCTION generate_daily_alerts()
RETURNS void AS $$
DECLARE
  doc RECORD;
  inv RECORD;
  tsk RECORD;
BEGIN
  -- DOCUMENTOS POR VENCER
  FOR doc IN
    SELECT cd.id, cd.cliente_id, cd.fecha_vencimiento, dt.nombre AS tipo_nombre,
           c.nombre AS cliente_nombre,
           (cd.fecha_vencimiento - CURRENT_DATE) AS dias_restantes
    FROM client_documents cd
    JOIN document_types dt ON dt.id = cd.document_type_id
    JOIN clientes c ON c.id = cd.cliente_id
    WHERE cd.estado IN ('vigente', 'por_vencer', 'vencido')
      AND (cd.fecha_vencimiento - CURRENT_DATE) IN (30, 15, 7, 1, 0)
      AND (
        (dt.alerta_dias_30 = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 30) OR
        (dt.alerta_dias_15 = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 15) OR
        (dt.alerta_dias_7  = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 7)  OR
        (dt.alerta_dias_1  = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 1)  OR
        ((cd.fecha_vencimiento - CURRENT_DATE) <= 0)
      )
  LOOP
    INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, accion_url, metadata)
    SELECT u.id,
      CASE WHEN doc.dias_restantes <= 0 THEN 'documento_vencido' ELSE 'documento_por_vencer' END,
      CASE WHEN doc.dias_restantes <= 0
        THEN 'Documento vencido: ' || doc.tipo_nombre
        ELSE 'Vence en ' || doc.dias_restantes || ' días: ' || doc.tipo_nombre
      END,
      doc.cliente_nombre || ' — ' || doc.tipo_nombre ||
      CASE WHEN doc.dias_restantes <= 0
        THEN ' venció el ' || TO_CHAR(doc.fecha_vencimiento, 'DD/MM/YYYY')
        ELSE ' vence el ' || TO_CHAR(doc.fecha_vencimiento, 'DD/MM/YYYY')
      END,
      '/compliance/documentos/' || doc.id,
      jsonb_build_object(
        'documento_id', doc.id,
        'cliente_id', doc.cliente_id,
        'dias_restantes', doc.dias_restantes
      )
    FROM usuarios u
    WHERE u.rol IN ('admin_sismac') AND u.activo = true
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- FACTURAS POR VENCER / VENCIDAS
  FOR inv IN
    SELECT i.id, i.numero, i.total, i.fecha_vencimiento,
           c.nombre AS cliente_nombre,
           (i.fecha_vencimiento - CURRENT_DATE) AS dias_restantes
    FROM invoices i
    JOIN clientes c ON c.id = i.cliente_id
    WHERE i.estado IN ('emitida', 'enviada')
      AND (i.fecha_vencimiento - CURRENT_DATE) IN (7, 3, 1, 0, -7, -15, -30)
  LOOP
    INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, accion_url, metadata)
    SELECT u.id,
      CASE WHEN inv.dias_restantes <= 0 THEN 'factura_vencida' ELSE 'factura_por_vencer' END,
      'Factura ' || inv.numero ||
        CASE WHEN inv.dias_restantes <= 0 THEN ' — VENCIDA' ELSE ' vence en ' || inv.dias_restantes || ' días' END,
      inv.cliente_nombre || ' — $' || TO_CHAR(inv.total, 'FM999,999,999.00') ||
      ' — Vto: ' || TO_CHAR(inv.fecha_vencimiento, 'DD/MM/YYYY'),
      '/finanzas/facturas/' || inv.id,
      jsonb_build_object('invoice_id', inv.id, 'dias_restantes', inv.dias_restantes)
    FROM usuarios u
    WHERE u.rol IN ('admin_sismac', 'admin_financiero') AND u.activo = true
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- TAREAS DEMORADAS
  FOR tsk IN
    SELECT t.id, t.titulo, t.asignado_a, t.fecha_limite, c.nombre AS cliente_nombre
    FROM tasks t
    LEFT JOIN clientes c ON c.id = t.cliente_id
    WHERE t.estado = 'demorada'
      AND t.asignado_a IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE (n.metadata->>'task_id')::TEXT = t.id::TEXT
          AND n.tipo = 'tarea_demorada'
          AND n.created_at > NOW() - INTERVAL '24 hours'
      )
  LOOP
    INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, accion_url, metadata)
    VALUES (
      tsk.asignado_a,
      'tarea_demorada',
      'Tarea demorada: ' || tsk.titulo,
      'Venció el ' || TO_CHAR(tsk.fecha_limite, 'DD/MM/YYYY HH24:MI') ||
        CASE WHEN tsk.cliente_nombre IS NOT NULL THEN ' — ' || tsk.cliente_nombre ELSE '' END,
      '/bpm/tareas/' || tsk.id,
      jsonb_build_object('task_id', tsk.id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Programar jobs con pg_cron (ejecutar manualmente en Supabase)
-- ============================================================
-- SELECT cron.schedule('sismac-vencimientos', '0 7 * * *', 'SELECT check_and_update_vencimientos()');
-- SELECT cron.schedule('sismac-alertas',      '5 7 * * *', 'SELECT generate_daily_alerts()');

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Audit log: solo admin puede leer, el trigger escribe con SECURITY DEFINER
CREATE POLICY "audit_log_admin" ON audit_log FOR SELECT
  USING (get_user_rol() = 'admin_sismac');

-- Notificaciones: cada usuario ve las suyas
CREATE POLICY "notifications_own" ON notifications FOR SELECT
  USING (usuario_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (usuario_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  USING (usuario_id = auth.uid());
CREATE POLICY "notifications_insert_system" ON notifications FOR INSERT
  WITH CHECK (true); -- El sistema inserta para cualquier usuario

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla ON audit_log(tabla, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_usuario_leida ON notifications(usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
-- ============================================================
-- SISMAC — Seed: Datos iniciales
-- ============================================================

-- ============================================================
-- CATEGORÍAS DE GASTOS
-- ============================================================
INSERT INTO expense_categories (nombre, descripcion, color, icono) VALUES
  ('Materiales',        'Insumos y materiales de trabajo',         '#3B82F6', 'package'),
  ('Herramientas',      'Compra o alquiler de herramientas',       '#8B5CF6', 'wrench'),
  ('Combustible',       'Nafta, gasoil, lubricantes',              '#F59E0B', 'fuel'),
  ('Transporte',        'Fletes, viáticos, peajes',                '#10B981', 'truck'),
  ('Honorarios',        'Servicios profesionales terceros',        '#6366F1', 'user-check'),
  ('Oficina',           'Papelería, insumos de oficina',           '#EC4899', 'building-2'),
  ('Servicios',         'Luz, agua, internet, teléfono',           '#14B8A6', 'zap'),
  ('Impuestos',         'Impuestos, tasas, contribuciones',        '#EF4444', 'landmark'),
  ('Mantenimiento',     'Mantenimiento instalaciones/equipos',     '#F97316', 'settings'),
  ('Seguros',           'Pólizas de seguros',                      '#0EA5E9', 'shield'),
  ('Capacitación',      'Cursos, seminarios, certificaciones',     '#84CC16', 'graduation-cap'),
  ('Otros',             'Gastos varios no categorizados',          '#6B7280', 'more-horizontal')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- TIPOS DE DOCUMENTOS COMPLIANCE
-- ============================================================
INSERT INTO document_types (nombre, descripcion, alerta_dias_30, alerta_dias_15, alerta_dias_7, alerta_dias_1, obligatorio, aplica_a) VALUES
  ('ART - Seguro de Riesgos del Trabajo',  'Seguro obligatorio para trabajadores',           true, true, true, true, true,  'empresa'),
  ('Seguro de Vida Obligatorio',           'Póliza de seguro de vida por convenio',           true, true, true, true, true,  'empresa'),
  ('Habilitación Municipal',               'Habilitación de la empresa para operar',          true, true, true, true, true,  'empresa'),
  ('Matrícula Profesional',                'Habilitación de técnicos/profesionales',          true, true, true, true, false, 'persona'),
  ('Carnet de Conducir',                   'Licencia de conducir del personal',               true, true, true, true, false, 'persona'),
  ('Libreta Sanitaria',                    'Libreta sanitaria vigente',                       true, true, true, true, false, 'persona'),
  ('Certificado Médico Preocupacional',    'Examen médico de ingreso o periódico',            true, true, true, true, false, 'persona'),
  ('Certificado de Aptitud Psicofísica',   'Apto psicofísico para tareas de riesgo',          true, true, true, true, false, 'persona'),
  ('Permiso de Trabajo en Altura',         'Habilitación para trabajos en altura',            true, true, true, true, false, 'persona'),
  ('Certificado EPGA',                     'Elementos de protección contra arco eléctrico',   true, true, true, true, false, 'persona'),
  ('Seguro de Equipo/Maquinaria',          'Póliza de equipo o herramienta mayor',            true, true, true, true, false, 'equipo'),
  ('Verificación Técnica Vehicular',       'VTV o equivalente de vehículos de empresa',       true, true, true, true, false, 'equipo'),
  ('Certificado de Calibración',           'Calibración de instrumentos de medición',         true, true, true, true, false, 'equipo'),
  ('Habilitación de Planta Específica',    'Autorización de planta cliente para ingreso',     true, true, true, true, true,  'empresa'),
  ('Constancia AFIP',                      'Constancia de inscripción AFIP actualizada',      false, false, true, true, true, 'empresa')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- CENTRO DE COSTO DEFAULT
-- ============================================================
INSERT INTO cost_centers (codigo, nombre, descripcion) VALUES
  ('CC-GEN', 'General',           'Gastos generales no asignables a un proyecto específico'),
  ('CC-ADM', 'Administración',    'Gastos del área administrativa'),
  ('CC-OPE', 'Operaciones',       'Gastos directos de operación y campo'),
  ('CC-VEN', 'Ventas',            'Gastos del área comercial y ventas'),
  ('CC-TEC', 'Tecnología',        'Software, hardware, sistemas')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- TAGS DE TAREAS DEFAULT
-- ============================================================
INSERT INTO task_tags (nombre, color) VALUES
  ('Urgente',       '#EF4444'),
  ('Cliente',       '#3B82F6'),
  ('Administrativo','#8B5CF6'),
  ('Técnico',       '#F59E0B'),
  ('Compliance',    '#10B981'),
  ('Revisión',      '#EC4899'),
  ('Bloquedo',      '#6B7280'),
  ('En Espera',     '#F97316')
ON CONFLICT (nombre) DO NOTHING;
