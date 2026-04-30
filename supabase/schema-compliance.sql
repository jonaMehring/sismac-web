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
