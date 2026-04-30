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
