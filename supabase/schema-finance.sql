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
