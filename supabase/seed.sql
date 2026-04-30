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
