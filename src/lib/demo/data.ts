// Datos de demostración — sin base de datos

export const DEMO_USER = {
  id: 'demo-00000000-0000-0000-0000-000000000001',
  email: 'admin@sismac.demo',
}

export const DEMO_PERFIL = {
  id: 'demo-00000000-0000-0000-0000-000000000001',
  nombre: 'Admin Demo',
  apellido: null,
  email: 'admin@sismac.demo',
  rol: 'admin_sismac' as const,
  activo: true,
  avatar_url: null,
  telefono: null,
  ultimo_acceso: new Date().toISOString(),
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
}

const hoy = new Date()
const d = (days: number) => new Date(hoy.getTime() + days * 86400000).toISOString().split('T')[0]

export const DEMO_DATA: Record<string, unknown[]> = {
  usuarios: [
    DEMO_PERFIL,
    { id: 'u2', nombre: 'María García', email: 'maria@sismac.demo', rol: 'supervisor_bpm', activo: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: 'u3', nombre: 'Carlos López', email: 'carlos@sismac.demo', rol: 'operario', activo: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: 'u4', nombre: 'Lucía Fernández', email: 'lucia@sismac.demo', rol: 'admin_financiero', activo: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  ],
  clientes: [
    { id: 'c1', nombre: 'Aceros del Sur S.A.', razon_social: 'Aceros del Sur S.A.', cuit: '30-71234567-1', email: 'contacto@acerosdelsur.com', telefono: '0341-4521234', localidad: 'Rosario', provincia: 'Santa Fe', activo: true, contacto_nombre: 'Roberto Martínez', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
    { id: 'c2', nombre: 'Frigorifico Norte S.R.L.', razon_social: 'Frigorifico Norte S.R.L.', cuit: '30-68901234-5', email: 'admin@frignorte.com.ar', telefono: '0387-4223456', localidad: 'Salta', provincia: 'Salta', activo: true, contacto_nombre: 'Ana Suárez', created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z' },
    { id: 'c3', nombre: 'Química Industrial Patagonia', razon_social: 'Química Industrial Patagonia S.A.', cuit: '30-70123456-8', email: 'info@quimicapatagonia.com', telefono: '0299-4445678', localidad: 'Neuquén', provincia: 'Neuquén', activo: true, contacto_nombre: 'Diego Morales', created_at: '2024-02-15T00:00:00Z', updated_at: '2024-02-15T00:00:00Z' },
    { id: 'c4', nombre: 'Textil Pampa S.A.', razon_social: 'Textil Pampa S.A.', cuit: '30-69876543-2', email: 'gerencia@textilpampa.com', telefono: '02302-445678', localidad: 'General Pico', provincia: 'La Pampa', activo: true, contacto_nombre: 'Silvia Torres', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
    { id: 'c5', nombre: 'Cementos Andinos S.A.', razon_social: 'Cementos Andinos S.A.', cuit: '30-72345678-9', email: 'operaciones@cementosandinos.com', telefono: '0261-4567890', localidad: 'Mendoza', provincia: 'Mendoza', activo: true, contacto_nombre: 'Jorge Herrera', created_at: '2024-03-15T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' },
  ],
  tasks: [
    { id: 't1', titulo: 'Inspección equipos planta Rosario', descripcion: 'Revisión preventiva de todos los equipos de línea de producción', estado: 'en_curso', prioridad: 'alta', asignado_a: 'u3', creado_por: DEMO_PERFIL.id, cliente_id: 'c1', fecha_limite: d(3), orden: 1, created_at: d(-5) + 'T10:00:00Z', updated_at: d(-1) + 'T10:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' }, asignado: { nombre: 'Carlos López' } },
    { id: 't2', titulo: 'Renovación ART Frigorifico Norte', descripcion: 'Gestionar renovación de la póliza ART antes del vencimiento', estado: 'pendiente', prioridad: 'critica', asignado_a: 'u2', creado_por: DEMO_PERFIL.id, cliente_id: 'c2', fecha_limite: d(2), orden: 2, created_at: d(-2) + 'T10:00:00Z', updated_at: d(-2) + 'T10:00:00Z', cliente: { nombre: 'Frigorifico Norte S.R.L.' }, asignado: { nombre: 'María García' } },
    { id: 't3', titulo: 'Auditoría ISO 9001 — Química Patagonia', descripcion: 'Preparación documentación para auditoría de recertificación', estado: 'en_revision', prioridad: 'alta', asignado_a: 'u2', creado_por: DEMO_PERFIL.id, cliente_id: 'c3', fecha_limite: d(10), orden: 3, created_at: d(-10) + 'T10:00:00Z', updated_at: d(-1) + 'T10:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' }, asignado: { nombre: 'María García' } },
    { id: 't4', titulo: 'Capacitación operarios Textil Pampa', descripcion: 'Dictado de capacitación en seguridad e higiene industrial', estado: 'completada', prioridad: 'normal', asignado_a: 'u3', creado_por: DEMO_PERFIL.id, cliente_id: 'c4', fecha_limite: d(-3), completada_en: d(-3) + 'T17:00:00Z', orden: 4, created_at: d(-15) + 'T10:00:00Z', updated_at: d(-3) + 'T10:00:00Z', cliente: { nombre: 'Textil Pampa S.A.' }, asignado: { nombre: 'Carlos López' } },
    { id: 't5', titulo: 'Relevamiento estructural silo #3', descripcion: 'Inspección técnica del silo número 3 — daños estructurales reportados', estado: 'demorada', prioridad: 'critica', asignado_a: 'u3', creado_por: DEMO_PERFIL.id, cliente_id: 'c5', fecha_limite: d(-5), orden: 5, created_at: d(-20) + 'T10:00:00Z', updated_at: d(-5) + 'T10:00:00Z', cliente: { nombre: 'Cementos Andinos S.A.' }, asignado: { nombre: 'Carlos López' } },
    { id: 't6', titulo: 'Informe mensual de operaciones', descripcion: 'Preparar informe consolidado de todas las operaciones del mes', estado: 'pendiente', prioridad: 'normal', asignado_a: DEMO_PERFIL.id, creado_por: DEMO_PERFIL.id, cliente_id: null, fecha_limite: d(7), orden: 6, created_at: d(-1) + 'T10:00:00Z', updated_at: d(-1) + 'T10:00:00Z', cliente: null, asignado: { nombre: 'Admin Demo' } },
    { id: 't7', titulo: 'Actualizar manual de procedimientos', estado: 'pendiente', prioridad: 'baja', asignado_a: DEMO_PERFIL.id, creado_por: DEMO_PERFIL.id, cliente_id: null, fecha_limite: d(30), orden: 7, created_at: d(-1) + 'T10:00:00Z', updated_at: d(-1) + 'T10:00:00Z', cliente: null, asignado: { nombre: 'Admin Demo' } },
  ],
  task_comments: [
    { id: 'tc1', task_id: 't1', autor_id: 'u3', contenido: 'Se realizó revisión inicial. Encontré desgaste en rodamientos línea B — requiere reemplazo en próxima parada.', tipo: 'comentario', created_at: d(-3) + 'T14:30:00Z', autor: { nombre: 'Carlos López' } },
    { id: 'tc2', task_id: 't1', autor_id: DEMO_PERFIL.id, contenido: 'Entendido. Coordinar con proveedor para tener los rodamientos antes del viernes.', tipo: 'comentario', created_at: d(-2) + 'T09:15:00Z', autor: { nombre: 'Admin Demo' } },
    { id: 'tc3', task_id: 't5', autor_id: 'u3', contenido: 'No pude acceder al silo el viernes — cliente no autorizó ingreso. Reprogramando para el lunes.', tipo: 'comentario', created_at: d(-4) + 'T16:00:00Z', autor: { nombre: 'Carlos López' } },
  ],
  processes: [
    { id: 'p1', nombre: 'Servicio anual Aceros del Sur', estado: 'activo', prioridad: 'alta', cliente_id: 'c1', created_at: d(-30) + 'T00:00:00Z' },
    { id: 'p2', nombre: 'Auditoría ISO Química Patagonia', estado: 'activo', prioridad: 'alta', cliente_id: 'c3', created_at: d(-10) + 'T00:00:00Z' },
  ],
  process_templates: [],
  expenses: [
    { id: 'e1', descripcion: 'Combustible visitas campo — mes abril', monto: 85000, moneda: 'ARS', fecha: d(-5), estado: 'aprobado', category_id: 'cat1', creado_por: DEMO_PERFIL.id, created_at: d(-5) + 'T10:00:00Z', categoria: { nombre: 'Combustible y transporte', color: '#f59e0b' }, proveedor: null, cliente: null },
    { id: 'e2', descripcion: 'Equipos de protección personal (EPP)', monto: 234500, moneda: 'ARS', fecha: d(-10), estado: 'aprobado', category_id: 'cat2', creado_por: DEMO_PERFIL.id, created_at: d(-10) + 'T10:00:00Z', categoria: { nombre: 'Equipamiento y herramientas', color: '#3b82f6' }, proveedor: { nombre: 'Seguridad Industrial S.A.' }, cliente: null },
    { id: 'e3', descripcion: 'Servicio calibración instrumentos', monto: 156000, moneda: 'ARS', fecha: d(-15), estado: 'aprobado', category_id: 'cat3', creado_por: DEMO_PERFIL.id, created_at: d(-15) + 'T10:00:00Z', categoria: { nombre: 'Servicios técnicos', color: '#8b5cf6' }, proveedor: { nombre: 'Metrolab Servicios' }, cliente: { nombre: 'Aceros del Sur S.A.' } },
    { id: 'e4', descripcion: 'Suscripción software gestión', monto: 48000, moneda: 'ARS', fecha: d(-3), estado: 'registrado', category_id: 'cat4', creado_por: DEMO_PERFIL.id, created_at: d(-3) + 'T10:00:00Z', categoria: { nombre: 'Software y tecnología', color: '#10b981' }, proveedor: null, cliente: null },
    { id: 'e5', descripcion: 'Viáticos viaje Neuquén', monto: 195000, moneda: 'ARS', fecha: d(-8), estado: 'aprobado', category_id: 'cat1', creado_por: DEMO_PERFIL.id, created_at: d(-8) + 'T10:00:00Z', categoria: { nombre: 'Combustible y transporte', color: '#f59e0b' }, proveedor: null, cliente: { nombre: 'Química Industrial Patagonia' } },
  ],
  expense_categories: [
    { id: 'cat1', nombre: 'Combustible y transporte', color: '#f59e0b' },
    { id: 'cat2', nombre: 'Equipamiento y herramientas', color: '#3b82f6' },
    { id: 'cat3', nombre: 'Servicios técnicos', color: '#8b5cf6' },
    { id: 'cat4', nombre: 'Software y tecnología', color: '#10b981' },
    { id: 'cat5', nombre: 'Honorarios profesionales', color: '#ef4444' },
    { id: 'cat6', nombre: 'Oficina y papelería', color: '#64748b' },
  ],
  proveedores: [
    { id: 'pv1', nombre: 'Seguridad Industrial S.A.', cuit: '30-71234567-1', activo: true, created_at: d(-100) + 'T00:00:00Z', updated_at: d(-100) + 'T00:00:00Z' },
    { id: 'pv2', nombre: 'Metrolab Servicios', cuit: '30-68901234-5', activo: true, created_at: d(-100) + 'T00:00:00Z', updated_at: d(-100) + 'T00:00:00Z' },
    { id: 'pv3', nombre: 'TecnoRepuestos Norte', cuit: '30-70123456-8', activo: true, created_at: d(-100) + 'T00:00:00Z', updated_at: d(-100) + 'T00:00:00Z' },
  ],
  cost_centers: [
    { id: 'cc1', codigo: 'OP-001', nombre: 'Operaciones Campo' },
    { id: 'cc2', codigo: 'AD-001', nombre: 'Administración General' },
    { id: 'cc3', codigo: 'TEC-001', nombre: 'Tecnología' },
  ],
  invoices: [
    { id: 'i1', numero: 'FAC-2024-0001', tipo: 'A', cliente_id: 'c1', subtotal: 850000, iva_porcentaje: 21, iva_monto: 178500, total: 1028500, moneda: 'ARS', fecha_emision: d(-20), fecha_vencimiento: d(10), estado: 'emitida', creado_por: DEMO_PERFIL.id, created_at: d(-20) + 'T10:00:00Z', updated_at: d(-20) + 'T10:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' }, creador: { nombre: 'Admin Demo' } },
    { id: 'i2', numero: 'FAC-2024-0002', tipo: 'B', cliente_id: 'c2', subtotal: 620000, iva_porcentaje: 21, iva_monto: 130200, total: 750200, moneda: 'ARS', fecha_emision: d(-35), fecha_vencimiento: d(-5), estado: 'vencida', creado_por: DEMO_PERFIL.id, created_at: d(-35) + 'T10:00:00Z', updated_at: d(-35) + 'T10:00:00Z', cliente: { nombre: 'Frigorifico Norte S.R.L.' }, creador: { nombre: 'Admin Demo' } },
    { id: 'i3', numero: 'FAC-2024-0003', tipo: 'A', cliente_id: 'c3', subtotal: 1200000, iva_porcentaje: 21, iva_monto: 252000, total: 1452000, moneda: 'ARS', fecha_emision: d(-60), fecha_vencimiento: d(-30), estado: 'cobrada', fecha_cobro: d(-28), creado_por: DEMO_PERFIL.id, created_at: d(-60) + 'T10:00:00Z', updated_at: d(-28) + 'T10:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' }, creador: { nombre: 'Admin Demo' } },
    { id: 'i4', numero: 'FAC-2024-0004', tipo: 'A', cliente_id: 'c4', subtotal: 480000, iva_porcentaje: 21, iva_monto: 100800, total: 580800, moneda: 'ARS', fecha_emision: d(-5), fecha_vencimiento: d(25), estado: 'enviada', creado_por: DEMO_PERFIL.id, created_at: d(-5) + 'T10:00:00Z', updated_at: d(-5) + 'T10:00:00Z', cliente: { nombre: 'Textil Pampa S.A.' }, creador: { nombre: 'Admin Demo' } },
  ],
  invoice_items: [
    { id: 'ii1', invoice_id: 'i1', descripcion: 'Servicio de inspección y mantenimiento preventivo', cantidad: 1, precio_unitario: 550000, subtotal: 550000, orden: 0 },
    { id: 'ii2', invoice_id: 'i1', descripcion: 'Informe técnico detallado', cantidad: 1, precio_unitario: 180000, subtotal: 180000, orden: 1 },
    { id: 'ii3', invoice_id: 'i1', descripcion: 'Materiales y repuestos utilizados', cantidad: 1, precio_unitario: 120000, subtotal: 120000, orden: 2 },
  ],
  budgets: [
    { id: 'b1', numero: 'PRES-2024-0001', titulo: 'Servicio anual de mantenimiento industrial', cliente_id: 'c5', subtotal: 2400000, iva_porcentaje: 21, iva_monto: 504000, total: 2904000, moneda: 'ARS', fecha_emision: d(-3), fecha_validez: d(27), estado: 'borrador', version_actual: 1, invoice_id: null, creado_por: DEMO_PERFIL.id, created_at: d(-3) + 'T10:00:00Z', updated_at: d(-3) + 'T10:00:00Z', cliente: { nombre: 'Cementos Andinos S.A.' }, creador: { nombre: 'Admin Demo' } },
    { id: 'b2', numero: 'PRES-2024-0002', titulo: 'Auditoría integral de procesos productivos', cliente_id: 'c3', subtotal: 3800000, iva_porcentaje: 21, iva_monto: 798000, total: 4598000, moneda: 'ARS', fecha_emision: d(-10), fecha_validez: d(20), estado: 'enviado', version_actual: 2, invoice_id: null, creado_por: DEMO_PERFIL.id, created_at: d(-10) + 'T10:00:00Z', updated_at: d(-7) + 'T10:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' }, creador: { nombre: 'Admin Demo' } },
    { id: 'b3', numero: 'PRES-2024-0003', titulo: 'Capacitación en seguridad e higiene — 40 operarios', cliente_id: 'c1', subtotal: 960000, iva_porcentaje: 21, iva_monto: 201600, total: 1161600, moneda: 'ARS', fecha_emision: d(-25), fecha_validez: d(-5), estado: 'aprobado', version_actual: 1, invoice_id: null, creado_por: DEMO_PERFIL.id, created_at: d(-25) + 'T10:00:00Z', updated_at: d(-20) + 'T10:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' }, creador: { nombre: 'Admin Demo' } },
  ],
  budget_items: [
    { id: 'bi1', budget_id: 'b1', descripcion: 'Visitas de mantenimiento preventivo (12 visitas)', cantidad: 12, precio_unitario: 150000, descuento_porcentaje: 0, subtotal: 1800000, orden: 0 },
    { id: 'bi2', budget_id: 'b1', descripcion: 'Informe semestral de estado de equipos', cantidad: 2, precio_unitario: 180000, descuento_porcentaje: 0, subtotal: 360000, orden: 1 },
    { id: 'bi3', budget_id: 'b1', descripcion: 'Disponibilidad guardia técnica 24/7', cantidad: 1, precio_unitario: 280000, descuento_porcentaje: 5, subtotal: 266000, orden: 2 },
  ],
  budget_versions: [
    { id: 'bv1', budget_id: 'b2', version_numero: 1, cambios: 'Versión inicial', created_at: d(-10) + 'T10:00:00Z' },
    { id: 'bv2', budget_id: 'b2', version_numero: 2, cambios: 'Ajuste de precios (+8%) por inflación', created_at: d(-7) + 'T10:00:00Z' },
  ],
  document_types: [
    { id: 'dt1', nombre: 'ART (Accidentes de Trabajo)', alerta_dias_30: true, alerta_dias_15: true, alerta_dias_7: true, alerta_dias_1: true, obligatorio: true, activo: true },
    { id: 'dt2', nombre: 'Seguro de Vida Obligatorio', alerta_dias_30: true, alerta_dias_15: true, alerta_dias_7: true, alerta_dias_1: true, obligatorio: true, activo: true },
    { id: 'dt3', nombre: 'Habilitación Municipal', alerta_dias_30: true, alerta_dias_15: true, alerta_dias_7: true, alerta_dias_1: true, obligatorio: true, activo: true },
    { id: 'dt4', nombre: 'Certificado IRAM / ISO', alerta_dias_30: true, alerta_dias_15: false, alerta_dias_7: false, alerta_dias_1: false, obligatorio: false, activo: true },
    { id: 'dt5', nombre: 'Registro de Empresa (AFIP)', alerta_dias_30: true, alerta_dias_15: true, alerta_dias_7: true, alerta_dias_1: true, obligatorio: true, activo: true },
  ],
  client_documents: [
    { id: 'd1', cliente_id: 'c2', document_type_id: 'dt1', nombre_archivo: 'ART_FrigorificoNorte_2024.pdf', fecha_emision: d(-365), fecha_vencimiento: d(-8), estado: 'vencido', cargado_por: DEMO_PERFIL.id, created_at: d(-365) + 'T00:00:00Z', cliente: { id: 'c2', nombre: 'Frigorifico Norte S.R.L.' }, document_type: { nombre: 'ART (Accidentes de Trabajo)' }, cargado_por_user: { nombre: 'Admin Demo' }, aprobado_por_user: null },
    { id: 'd2', cliente_id: 'c5', document_type_id: 'dt2', nombre_archivo: 'SeguroVida_CementosAndinos_2024.pdf', fecha_emision: d(-300), fecha_vencimiento: d(5), estado: 'por_vencer', cargado_por: DEMO_PERFIL.id, created_at: d(-300) + 'T00:00:00Z', cliente: { id: 'c5', nombre: 'Cementos Andinos S.A.' }, document_type: { nombre: 'Seguro de Vida Obligatorio' }, cargado_por_user: { nombre: 'Admin Demo' }, aprobado_por_user: { nombre: 'Admin Demo' } },
    { id: 'd3', cliente_id: 'c1', document_type_id: 'dt1', nombre_archivo: 'ART_AcerosSur_2025.pdf', fecha_emision: d(-30), fecha_vencimiento: d(335), estado: 'vigente', cargado_por: DEMO_PERFIL.id, created_at: d(-30) + 'T00:00:00Z', cliente: { id: 'c1', nombre: 'Aceros del Sur S.A.' }, document_type: { nombre: 'ART (Accidentes de Trabajo)' }, cargado_por_user: { nombre: 'Admin Demo' }, aprobado_por_user: { nombre: 'Admin Demo' } },
    { id: 'd4', cliente_id: 'c3', document_type_id: 'dt3', nombre_archivo: 'HabMunicipal_QuimicaPat_2025.pdf', fecha_emision: d(-60), fecha_vencimiento: d(25), estado: 'por_vencer', cargado_por: DEMO_PERFIL.id, created_at: d(-60) + 'T00:00:00Z', cliente: { id: 'c3', nombre: 'Química Industrial Patagonia' }, document_type: { nombre: 'Habilitación Municipal' }, cargado_por_user: { nombre: 'Admin Demo' }, aprobado_por_user: { nombre: 'Admin Demo' } },
    { id: 'd5', cliente_id: 'c4', document_type_id: 'dt4', nombre_archivo: 'ISO9001_TextilPampa_2024.pdf', fecha_emision: d(-180), fecha_vencimiento: d(185), estado: 'vigente', cargado_por: DEMO_PERFIL.id, created_at: d(-180) + 'T00:00:00Z', cliente: { id: 'c4', nombre: 'Textil Pampa S.A.' }, document_type: { nombre: 'Certificado IRAM / ISO' }, cargado_por_user: { nombre: 'Admin Demo' }, aprobado_por_user: { nombre: 'Admin Demo' } },
    { id: 'd6', cliente_id: 'c2', document_type_id: 'dt2', nombre_archivo: 'SegVida_FrigorificoNorte_new.pdf', fecha_emision: d(-5), fecha_vencimiento: d(360), estado: 'pendiente_aprobacion', cargado_por: DEMO_PERFIL.id, created_at: d(-5) + 'T00:00:00Z', cliente: { id: 'c2', nombre: 'Frigorifico Norte S.R.L.' }, document_type: { nombre: 'Seguro de Vida Obligatorio' }, cargado_por_user: { nombre: 'María García' }, aprobado_por_user: null },
  ],
  consuman_entries: [],
  notifications: [],
  audit_log: [
    { id: 'al1', usuario_id: DEMO_PERFIL.id, accion: 'INSERT', tabla: 'tasks', registro_id: 't1', datos_anteriores: null, datos_nuevos: { titulo: 'Inspección equipos planta Rosario' }, ip_address: '192.168.1.1', created_at: d(-5) + 'T10:00:00Z', usuario: { nombre: 'Admin Demo' } },
    { id: 'al2', usuario_id: 'u3', accion: 'UPDATE', tabla: 'tasks', registro_id: 't1', datos_anteriores: { estado: 'pendiente' }, datos_nuevos: { estado: 'en_curso' }, ip_address: '192.168.1.2', created_at: d(-4) + 'T14:00:00Z', usuario: { nombre: 'Carlos López' } },
    { id: 'al3', usuario_id: DEMO_PERFIL.id, accion: 'INSERT', tabla: 'invoices', registro_id: 'i1', datos_anteriores: null, datos_nuevos: { numero: 'FAC-2024-0001', total: 1028500 }, ip_address: '192.168.1.1', created_at: d(-20) + 'T10:00:00Z', usuario: { nombre: 'Admin Demo' } },
    { id: 'al4', usuario_id: DEMO_PERFIL.id, accion: 'INSERT', tabla: 'client_documents', registro_id: 'd3', datos_anteriores: null, datos_nuevos: { nombre_archivo: 'ART_AcerosSur_2025.pdf' }, ip_address: '192.168.1.1', created_at: d(-30) + 'T10:00:00Z', usuario: { nombre: 'Admin Demo' } },
    { id: 'al5', usuario_id: DEMO_PERFIL.id, accion: 'UPDATE', tabla: 'budgets', registro_id: 'b2', datos_anteriores: { estado: 'borrador' }, datos_nuevos: { estado: 'enviado' }, ip_address: '192.168.1.1', created_at: d(-7) + 'T10:00:00Z', usuario: { nombre: 'Admin Demo' } },
  ],
  sectores: [
    { id: 's1', cliente_id: 'c1', nombre: 'Planta Principal Rosario', activo: true, equipos: [{ id: 'eq1', nombre: 'Torno CNC #1', estado: 'operativo' }, { id: 'eq2', nombre: 'Prensa Hidráulica', estado: 'mantenimiento' }] },
    { id: 's2', cliente_id: 'c1', nombre: 'Depósito Norte', activo: true, equipos: [] },
  ],
  equipos: [],
}
