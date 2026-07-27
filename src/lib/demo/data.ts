// Datos de demostración — sin base de datos
import { CHECKLIST_TEMPLATE, type ItemEstado } from '@/lib/inspecciones/config'

// Genera un checklist completado a partir de la plantilla, marcando como "observado"/"no_conforme"
// los ítems indicados (por "categoriaIndex.itemIndex") — el resto queda "conforme".
function buildChecklist(overrides: Record<string, ItemEstado> = {}, notas: Record<string, string> = {}) {
  return CHECKLIST_TEMPLATE.map((cat, ci) => ({
    categoria: cat.categoria,
    items: cat.items.map((nombre, ii) => {
      const key = `${ci}.${ii}`
      return { nombre, estado: overrides[key] ?? ('conforme' as ItemEstado), nota: notas[key] ?? '' }
    }),
  }))
}

export const DEMO_USER = {
  id: 'demo-00000000-0000-0000-0000-000000000001',
  email: 'admin@gmail.com',
}

export const DEMO_PERFIL = {
  id: 'demo-00000000-0000-0000-0000-000000000001',
  nombre: 'Martín Rossi',
  apellido: null,
  email: 'admin@gmail.com',
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
    { id: 'u2', nombre: 'María García', email: 'maria.garcia@ingesar.com', rol: 'supervisor_bpm', activo: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: 'u3', nombre: 'Carlos López', email: 'carlos.lopez@ingesar.com', rol: 'operario', activo: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: 'u4', nombre: 'Lucía Fernández', email: 'lucia.fernandez@ingesar.com', rol: 'admin_financiero', activo: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
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
    { id: 't6', titulo: 'Informe mensual de operaciones', descripcion: 'Preparar informe consolidado de todas las operaciones del mes', estado: 'pendiente', prioridad: 'normal', asignado_a: DEMO_PERFIL.id, creado_por: DEMO_PERFIL.id, cliente_id: null, fecha_limite: d(7), orden: 6, created_at: d(-1) + 'T10:00:00Z', updated_at: d(-1) + 'T10:00:00Z', cliente: null, asignado: { nombre: 'Martín Rossi' } },
    { id: 't7', titulo: 'Actualizar manual de procedimientos', estado: 'pendiente', prioridad: 'baja', asignado_a: DEMO_PERFIL.id, creado_por: DEMO_PERFIL.id, cliente_id: null, fecha_limite: d(30), orden: 7, created_at: d(-1) + 'T10:00:00Z', updated_at: d(-1) + 'T10:00:00Z', cliente: null, asignado: { nombre: 'Martín Rossi' } },
  ],
  task_comments: [
    { id: 'tc1', task_id: 't1', autor_id: 'u3', contenido: 'Se realizó revisión inicial. Encontré desgaste en rodamientos línea B — requiere reemplazo en próxima parada.', tipo: 'comentario', created_at: d(-3) + 'T14:30:00Z', autor: { nombre: 'Carlos López' } },
    { id: 'tc2', task_id: 't1', autor_id: DEMO_PERFIL.id, contenido: 'Entendido. Coordinar con proveedor para tener los rodamientos antes del viernes.', tipo: 'comentario', created_at: d(-2) + 'T09:15:00Z', autor: { nombre: 'Martín Rossi' } },
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
    // Histórico — mes -1
    { id: 'e6', descripcion: 'Repuestos línea de producción', monto: 312000, moneda: 'ARS', fecha: d(-34), estado: 'aprobado', category_id: 'cat2', creado_por: DEMO_PERFIL.id, created_at: d(-34) + 'T10:00:00Z', categoria: { nombre: 'Equipamiento y herramientas', color: '#3b82f6' }, proveedor: { nombre: 'TecnoRepuestos Norte' }, cliente: { nombre: 'Aceros del Sur S.A.' } },
    { id: 'e7', descripcion: 'Honorarios consultoría ISO', monto: 420000, moneda: 'ARS', fecha: d(-40), estado: 'aprobado', category_id: 'cat5', creado_por: DEMO_PERFIL.id, created_at: d(-40) + 'T10:00:00Z', categoria: { nombre: 'Honorarios profesionales', color: '#ef4444' }, proveedor: null, cliente: { nombre: 'Química Industrial Patagonia' } },
    { id: 'e8', descripcion: 'Combustible flota — mes anterior', monto: 128000, moneda: 'ARS', fecha: d(-45), estado: 'aprobado', category_id: 'cat1', creado_por: DEMO_PERFIL.id, created_at: d(-45) + 'T10:00:00Z', categoria: { nombre: 'Combustible y transporte', color: '#f59e0b' }, proveedor: null, cliente: null },
    // Histórico — mes -2
    { id: 'e9', descripcion: 'Calibración de instrumentos', monto: 174000, moneda: 'ARS', fecha: d(-66), estado: 'aprobado', category_id: 'cat3', creado_por: DEMO_PERFIL.id, created_at: d(-66) + 'T10:00:00Z', categoria: { nombre: 'Servicios técnicos', color: '#8b5cf6' }, proveedor: { nombre: 'Metrolab Servicios' }, cliente: { nombre: 'Cementos Andinos S.A.' } },
    { id: 'e10', descripcion: 'Renovación licencias software', monto: 96000, moneda: 'ARS', fecha: d(-72), estado: 'aprobado', category_id: 'cat4', creado_por: DEMO_PERFIL.id, created_at: d(-72) + 'T10:00:00Z', categoria: { nombre: 'Software y tecnología', color: '#10b981' }, proveedor: null, cliente: null },
    // Histórico — mes -3
    { id: 'e11', descripcion: 'EPP y elementos de seguridad', monto: 268000, moneda: 'ARS', fecha: d(-96), estado: 'aprobado', category_id: 'cat2', creado_por: DEMO_PERFIL.id, created_at: d(-96) + 'T10:00:00Z', categoria: { nombre: 'Equipamiento y herramientas', color: '#3b82f6' }, proveedor: { nombre: 'Seguridad Industrial S.A.' }, cliente: null },
    { id: 'e12', descripcion: 'Viáticos campaña relevamiento', monto: 152000, moneda: 'ARS', fecha: d(-100), estado: 'aprobado', category_id: 'cat1', creado_por: DEMO_PERFIL.id, created_at: d(-100) + 'T10:00:00Z', categoria: { nombre: 'Combustible y transporte', color: '#f59e0b' }, proveedor: null, cliente: { nombre: 'Textil Pampa S.A.' } },
    // Histórico — mes -4
    { id: 'e13', descripcion: 'Servicio técnico especializado', monto: 205000, moneda: 'ARS', fecha: d(-126), estado: 'aprobado', category_id: 'cat3', creado_por: DEMO_PERFIL.id, created_at: d(-126) + 'T10:00:00Z', categoria: { nombre: 'Servicios técnicos', color: '#8b5cf6' }, proveedor: { nombre: 'Metrolab Servicios' }, cliente: { nombre: 'Aceros del Sur S.A.' } },
    { id: 'e14', descripcion: 'Insumos de oficina', monto: 64000, moneda: 'ARS', fecha: d(-132), estado: 'aprobado', category_id: 'cat6', creado_por: DEMO_PERFIL.id, created_at: d(-132) + 'T10:00:00Z', categoria: { nombre: 'Oficina y papelería', color: '#64748b' }, proveedor: null, cliente: null },
    // Histórico — mes -5
    { id: 'e15', descripcion: 'Herramientas de medición', monto: 298000, moneda: 'ARS', fecha: d(-156), estado: 'aprobado', category_id: 'cat2', creado_por: DEMO_PERFIL.id, created_at: d(-156) + 'T10:00:00Z', categoria: { nombre: 'Equipamiento y herramientas', color: '#3b82f6' }, proveedor: { nombre: 'TecnoRepuestos Norte' }, cliente: null },
    { id: 'e16', descripcion: 'Honorarios auditoría externa', monto: 356000, moneda: 'ARS', fecha: d(-160), estado: 'aprobado', category_id: 'cat5', creado_por: DEMO_PERFIL.id, created_at: d(-160) + 'T10:00:00Z', categoria: { nombre: 'Honorarios profesionales', color: '#ef4444' }, proveedor: null, cliente: { nombre: 'Frigorifico Norte S.R.L.' } },
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
    { id: 'i1', numero: 'FAC-2024-0001', tipo: 'A', cliente_id: 'c1', subtotal: 850000, iva_porcentaje: 21, iva_monto: 178500, total: 1028500, moneda: 'ARS', fecha_emision: d(-20), fecha_vencimiento: d(10), estado: 'emitida', creado_por: DEMO_PERFIL.id, created_at: d(-20) + 'T10:00:00Z', updated_at: d(-20) + 'T10:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i2', numero: 'FAC-2024-0002', tipo: 'B', cliente_id: 'c2', subtotal: 620000, iva_porcentaje: 21, iva_monto: 130200, total: 750200, moneda: 'ARS', fecha_emision: d(-35), fecha_vencimiento: d(-5), estado: 'vencida', creado_por: DEMO_PERFIL.id, created_at: d(-35) + 'T10:00:00Z', updated_at: d(-35) + 'T10:00:00Z', cliente: { nombre: 'Frigorifico Norte S.R.L.' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i3', numero: 'FAC-2024-0003', tipo: 'A', cliente_id: 'c3', subtotal: 1200000, iva_porcentaje: 21, iva_monto: 252000, total: 1452000, moneda: 'ARS', fecha_emision: d(-60), fecha_vencimiento: d(-30), estado: 'cobrada', fecha_cobro: d(-28), creado_por: DEMO_PERFIL.id, created_at: d(-60) + 'T10:00:00Z', updated_at: d(-28) + 'T10:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i4', numero: 'FAC-2024-0004', tipo: 'A', cliente_id: 'c4', subtotal: 480000, iva_porcentaje: 21, iva_monto: 100800, total: 580800, moneda: 'ARS', fecha_emision: d(-5), fecha_vencimiento: d(25), estado: 'enviada', creado_por: DEMO_PERFIL.id, created_at: d(-5) + 'T10:00:00Z', updated_at: d(-5) + 'T10:00:00Z', cliente: { nombre: 'Textil Pampa S.A.' }, creador: { nombre: 'Martín Rossi' } },
    // Histórico facturado/cobrado — 6 meses
    { id: 'i5', numero: 'FAC-2024-0005', tipo: 'A', cliente_id: 'c5', subtotal: 1650000, iva_porcentaje: 21, iva_monto: 346500, total: 1996500, moneda: 'ARS', fecha_emision: d(-38), fecha_vencimiento: d(-8), estado: 'cobrada', fecha_cobro: d(-10), creado_por: DEMO_PERFIL.id, created_at: d(-38) + 'T10:00:00Z', updated_at: d(-10) + 'T10:00:00Z', cliente: { nombre: 'Cementos Andinos S.A.' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i6', numero: 'FAC-2024-0006', tipo: 'B', cliente_id: 'c1', subtotal: 720000, iva_porcentaje: 21, iva_monto: 151200, total: 871200, moneda: 'ARS', fecha_emision: d(-44), fecha_vencimiento: d(-14), estado: 'cobrada', fecha_cobro: d(-20), creado_por: DEMO_PERFIL.id, created_at: d(-44) + 'T10:00:00Z', updated_at: d(-20) + 'T10:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i7', numero: 'FAC-2024-0007', tipo: 'A', cliente_id: 'c3', subtotal: 2100000, iva_porcentaje: 21, iva_monto: 441000, total: 2541000, moneda: 'ARS', fecha_emision: d(-70), fecha_vencimiento: d(-40), estado: 'cobrada', fecha_cobro: d(-45), creado_por: DEMO_PERFIL.id, created_at: d(-70) + 'T10:00:00Z', updated_at: d(-45) + 'T10:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i8', numero: 'FAC-2024-0008', tipo: 'A', cliente_id: 'c2', subtotal: 890000, iva_porcentaje: 21, iva_monto: 186900, total: 1076900, moneda: 'ARS', fecha_emision: d(-98), fecha_vencimiento: d(-68), estado: 'cobrada', fecha_cobro: d(-72), creado_por: DEMO_PERFIL.id, created_at: d(-98) + 'T10:00:00Z', updated_at: d(-72) + 'T10:00:00Z', cliente: { nombre: 'Frigorifico Norte S.R.L.' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i9', numero: 'FAC-2024-0009', tipo: 'A', cliente_id: 'c1', subtotal: 1380000, iva_porcentaje: 21, iva_monto: 289800, total: 1669800, moneda: 'ARS', fecha_emision: d(-128), fecha_vencimiento: d(-98), estado: 'cobrada', fecha_cobro: d(-100), creado_por: DEMO_PERFIL.id, created_at: d(-128) + 'T10:00:00Z', updated_at: d(-100) + 'T10:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'i10', numero: 'FAC-2024-0010', tipo: 'A', cliente_id: 'c4', subtotal: 1520000, iva_porcentaje: 21, iva_monto: 319200, total: 1839200, moneda: 'ARS', fecha_emision: d(-158), fecha_vencimiento: d(-128), estado: 'cobrada', fecha_cobro: d(-132), creado_por: DEMO_PERFIL.id, created_at: d(-158) + 'T10:00:00Z', updated_at: d(-132) + 'T10:00:00Z', cliente: { nombre: 'Textil Pampa S.A.' }, creador: { nombre: 'Martín Rossi' } },
  ],
  invoice_items: [
    { id: 'ii1', invoice_id: 'i1', descripcion: 'Servicio de inspección y mantenimiento preventivo', cantidad: 1, precio_unitario: 550000, subtotal: 550000, orden: 0 },
    { id: 'ii2', invoice_id: 'i1', descripcion: 'Informe técnico detallado', cantidad: 1, precio_unitario: 180000, subtotal: 180000, orden: 1 },
    { id: 'ii3', invoice_id: 'i1', descripcion: 'Materiales y repuestos utilizados', cantidad: 1, precio_unitario: 120000, subtotal: 120000, orden: 2 },
  ],
  budgets: [
    { id: 'b1', numero: 'PRES-2024-0001', titulo: 'Servicio anual de mantenimiento industrial', cliente_id: 'c5', subtotal: 2400000, iva_porcentaje: 21, iva_monto: 504000, total: 2904000, moneda: 'ARS', fecha_emision: d(-3), fecha_validez: d(27), estado: 'borrador', version_actual: 1, invoice_id: null, creado_por: DEMO_PERFIL.id, created_at: d(-3) + 'T10:00:00Z', updated_at: d(-3) + 'T10:00:00Z', cliente: { nombre: 'Cementos Andinos S.A.' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'b2', numero: 'PRES-2024-0002', titulo: 'Auditoría integral de procesos productivos', cliente_id: 'c3', subtotal: 3800000, iva_porcentaje: 21, iva_monto: 798000, total: 4598000, moneda: 'ARS', fecha_emision: d(-10), fecha_validez: d(20), estado: 'enviado', version_actual: 2, invoice_id: null, creado_por: DEMO_PERFIL.id, created_at: d(-10) + 'T10:00:00Z', updated_at: d(-7) + 'T10:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' }, creador: { nombre: 'Martín Rossi' } },
    { id: 'b3', numero: 'PRES-2024-0003', titulo: 'Capacitación en seguridad e higiene — 40 operarios', cliente_id: 'c1', subtotal: 960000, iva_porcentaje: 21, iva_monto: 201600, total: 1161600, moneda: 'ARS', fecha_emision: d(-25), fecha_validez: d(-5), estado: 'aprobado', version_actual: 1, invoice_id: null, creado_por: DEMO_PERFIL.id, created_at: d(-25) + 'T10:00:00Z', updated_at: d(-20) + 'T10:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' }, creador: { nombre: 'Martín Rossi' } },
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
    { id: 'd1', cliente_id: 'c2', document_type_id: 'dt1', nombre_archivo: 'ART_FrigorificoNorte_2024.pdf', fecha_emision: d(-365), fecha_vencimiento: d(-8), estado: 'vencido', cargado_por: DEMO_PERFIL.id, created_at: d(-365) + 'T00:00:00Z', cliente: { id: 'c2', nombre: 'Frigorifico Norte S.R.L.' }, document_type: { nombre: 'ART (Accidentes de Trabajo)' }, cargado_por_user: { nombre: 'Martín Rossi' }, aprobado_por_user: null },
    { id: 'd2', cliente_id: 'c5', document_type_id: 'dt2', nombre_archivo: 'SeguroVida_CementosAndinos_2024.pdf', fecha_emision: d(-300), fecha_vencimiento: d(5), estado: 'por_vencer', cargado_por: DEMO_PERFIL.id, created_at: d(-300) + 'T00:00:00Z', cliente: { id: 'c5', nombre: 'Cementos Andinos S.A.' }, document_type: { nombre: 'Seguro de Vida Obligatorio' }, cargado_por_user: { nombre: 'Martín Rossi' }, aprobado_por_user: { nombre: 'Martín Rossi' } },
    { id: 'd3', cliente_id: 'c1', document_type_id: 'dt1', nombre_archivo: 'ART_AcerosSur_2025.pdf', fecha_emision: d(-30), fecha_vencimiento: d(335), estado: 'vigente', cargado_por: DEMO_PERFIL.id, created_at: d(-30) + 'T00:00:00Z', cliente: { id: 'c1', nombre: 'Aceros del Sur S.A.' }, document_type: { nombre: 'ART (Accidentes de Trabajo)' }, cargado_por_user: { nombre: 'Martín Rossi' }, aprobado_por_user: { nombre: 'Martín Rossi' } },
    { id: 'd4', cliente_id: 'c3', document_type_id: 'dt3', nombre_archivo: 'HabMunicipal_QuimicaPat_2025.pdf', fecha_emision: d(-60), fecha_vencimiento: d(25), estado: 'por_vencer', cargado_por: DEMO_PERFIL.id, created_at: d(-60) + 'T00:00:00Z', cliente: { id: 'c3', nombre: 'Química Industrial Patagonia' }, document_type: { nombre: 'Habilitación Municipal' }, cargado_por_user: { nombre: 'Martín Rossi' }, aprobado_por_user: { nombre: 'Martín Rossi' } },
    { id: 'd5', cliente_id: 'c4', document_type_id: 'dt4', nombre_archivo: 'ISO9001_TextilPampa_2024.pdf', fecha_emision: d(-180), fecha_vencimiento: d(185), estado: 'vigente', cargado_por: DEMO_PERFIL.id, created_at: d(-180) + 'T00:00:00Z', cliente: { id: 'c4', nombre: 'Textil Pampa S.A.' }, document_type: { nombre: 'Certificado IRAM / ISO' }, cargado_por_user: { nombre: 'Martín Rossi' }, aprobado_por_user: { nombre: 'Martín Rossi' } },
    { id: 'd6', cliente_id: 'c2', document_type_id: 'dt2', nombre_archivo: 'SegVida_FrigorificoNorte_new.pdf', fecha_emision: d(-5), fecha_vencimiento: d(360), estado: 'pendiente_aprobacion', cargado_por: DEMO_PERFIL.id, created_at: d(-5) + 'T00:00:00Z', cliente: { id: 'c2', nombre: 'Frigorifico Norte S.R.L.' }, document_type: { nombre: 'Seguro de Vida Obligatorio' }, cargado_por_user: { nombre: 'María García' }, aprobado_por_user: null },
  ],
  consuman_entries: [],
  notifications: [],
  audit_log: [
    { id: 'al1', usuario_id: DEMO_PERFIL.id, accion: 'INSERT', tabla: 'tasks', registro_id: 't1', datos_anteriores: null, datos_nuevos: { titulo: 'Inspección equipos planta Rosario' }, ip_address: '192.168.1.1', created_at: d(-5) + 'T10:00:00Z', usuario: { nombre: 'Martín Rossi' } },
    { id: 'al2', usuario_id: 'u3', accion: 'UPDATE', tabla: 'tasks', registro_id: 't1', datos_anteriores: { estado: 'pendiente' }, datos_nuevos: { estado: 'en_curso' }, ip_address: '192.168.1.2', created_at: d(-4) + 'T14:00:00Z', usuario: { nombre: 'Carlos López' } },
    { id: 'al3', usuario_id: DEMO_PERFIL.id, accion: 'INSERT', tabla: 'invoices', registro_id: 'i1', datos_anteriores: null, datos_nuevos: { numero: 'FAC-2024-0001', total: 1028500 }, ip_address: '192.168.1.1', created_at: d(-20) + 'T10:00:00Z', usuario: { nombre: 'Martín Rossi' } },
    { id: 'al4', usuario_id: DEMO_PERFIL.id, accion: 'INSERT', tabla: 'client_documents', registro_id: 'd3', datos_anteriores: null, datos_nuevos: { nombre_archivo: 'ART_AcerosSur_2025.pdf' }, ip_address: '192.168.1.1', created_at: d(-30) + 'T10:00:00Z', usuario: { nombre: 'Martín Rossi' } },
    { id: 'al5', usuario_id: DEMO_PERFIL.id, accion: 'UPDATE', tabla: 'budgets', registro_id: 'b2', datos_anteriores: { estado: 'borrador' }, datos_nuevos: { estado: 'enviado' }, ip_address: '192.168.1.1', created_at: d(-7) + 'T10:00:00Z', usuario: { nombre: 'Martín Rossi' } },
  ],
  sectores: [
    { id: 's1', cliente_id: 'c1', nombre: 'Planta Principal Rosario', activo: true, equipos: [{ id: 'eq1', nombre: 'Torno CNC #1', estado: 'operativo' }, { id: 'eq2', nombre: 'Prensa Hidráulica', estado: 'mantenimiento' }] },
    { id: 's2', cliente_id: 'c1', nombre: 'Depósito Norte', activo: true, equipos: [] },
  ],
  equipos: [],

  // ── MÓDULO INSPECCIONES DE EQUIPOS ──
  insp_equipos: [
    { id: 'ie1', codigo: 'MOT-001', nombre: 'Motor principal línea A', tipo: 'Motor eléctrico', marca: 'WEG', modelo: 'W22 132M', numero_serie: 'WEG-2021-45871', cliente_id: 'c1', ubicacion: 'Planta Principal Rosario — Línea A', fecha_puesta_servicio: d(-820), estado: 'operativo', criticidad: 'alta', horas_uso: 14200, potencia: '30 kW', ultima_inspeccion: d(-25), proxima_inspeccion: d(65), created_at: d(-820) + 'T00:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' } },
    { id: 'ie2', codigo: 'PRE-002', nombre: 'Prensa hidráulica 200T', tipo: 'Prensa', marca: 'Schuler', modelo: 'PH-200', numero_serie: 'SCH-2019-1122', cliente_id: 'c1', ubicacion: 'Planta Principal Rosario — Estampado', fecha_puesta_servicio: d(-1400), estado: 'mantenimiento', criticidad: 'critica', horas_uso: 22800, potencia: '200 Tn', ultima_inspeccion: d(-8), proxima_inspeccion: d(7), created_at: d(-1400) + 'T00:00:00Z', cliente: { nombre: 'Aceros del Sur S.A.' } },
    { id: 'ie3', codigo: 'COM-003', nombre: 'Compresor de tornillo', tipo: 'Compresor', marca: 'Atlas Copco', modelo: 'GA-55', numero_serie: 'AC-2020-99341', cliente_id: 'c2', ubicacion: 'Sala de máquinas — Frigorífico', fecha_puesta_servicio: d(-980), estado: 'operativo', criticidad: 'alta', horas_uso: 18600, potencia: '55 kW', ultima_inspeccion: d(-40), proxima_inspeccion: d(50), created_at: d(-980) + 'T00:00:00Z', cliente: { nombre: 'Frigorifico Norte S.R.L.' } },
    { id: 'ie4', codigo: 'CAL-004', nombre: 'Caldera de vapor', tipo: 'Caldera', marca: 'Fontanet', modelo: 'FV-3000', numero_serie: 'FON-2018-7754', cliente_id: 'c2', ubicacion: 'Sala de calderas', fecha_puesta_servicio: d(-1900), estado: 'operativo', criticidad: 'critica', horas_uso: 31200, potencia: '3000 kg/h', ultima_inspeccion: d(-15), proxima_inspeccion: d(-3), created_at: d(-1900) + 'T00:00:00Z', cliente: { nombre: 'Frigorifico Norte S.R.L.' } },
    { id: 'ie5', codigo: 'BOM-005', nombre: 'Bomba centrífuga proceso', tipo: 'Bomba', marca: 'Grundfos', modelo: 'NB-65', numero_serie: 'GRU-2022-33210', cliente_id: 'c3', ubicacion: 'Área de proceso químico', fecha_puesta_servicio: d(-560), estado: 'operativo', criticidad: 'media', horas_uso: 9800, potencia: '15 kW', ultima_inspeccion: d(-55), proxima_inspeccion: d(35), created_at: d(-560) + 'T00:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' } },
    { id: 'ie6', codigo: 'PGR-006', nombre: 'Puente grúa 10T', tipo: 'Puente grúa', marca: 'Demag', modelo: 'EKKE-10', numero_serie: 'DEM-2017-5590', cliente_id: 'c3', ubicacion: 'Nave de producción', fecha_puesta_servicio: d(-2100), estado: 'fuera_servicio', criticidad: 'critica', horas_uso: 12400, potencia: '10 Tn', ultima_inspeccion: d(-5), proxima_inspeccion: d(2), created_at: d(-2100) + 'T00:00:00Z', cliente: { nombre: 'Química Industrial Patagonia' } },
    { id: 'ie7', codigo: 'TAB-007', nombre: 'Tablero general BT', tipo: 'Tablero eléctrico', marca: 'Schneider', modelo: 'Prisma-P', numero_serie: 'SE-2021-88120', cliente_id: 'c4', ubicacion: 'Sala eléctrica principal', fecha_puesta_servicio: d(-740), estado: 'operativo', criticidad: 'alta', horas_uso: 0, potencia: '630 A', ultima_inspeccion: d(-90), proxima_inspeccion: d(90), created_at: d(-740) + 'T00:00:00Z', cliente: { nombre: 'Textil Pampa S.A.' } },
    { id: 'ie8', codigo: 'CIN-008', nombre: 'Cinta transportadora principal', tipo: 'Cinta transportadora', marca: 'Continental', modelo: 'CT-800', numero_serie: 'CON-2020-4471', cliente_id: 'c4', ubicacion: 'Línea de empaque', fecha_puesta_servicio: d(-1050), estado: 'operativo', criticidad: 'media', horas_uso: 16700, potencia: '7.5 kW', ultima_inspeccion: d(-120), proxima_inspeccion: d(-30), created_at: d(-1050) + 'T00:00:00Z', cliente: { nombre: 'Textil Pampa S.A.' } },
    { id: 'ie9', codigo: 'GEN-009', nombre: 'Grupo electrógeno', tipo: 'Generador', marca: 'Cummins', modelo: 'C275-D5', numero_serie: 'CUM-2019-6612', cliente_id: 'c5', ubicacion: 'Sala de generación', fecha_puesta_servicio: d(-1500), estado: 'operativo', criticidad: 'alta', horas_uso: 4200, potencia: '275 kVA', ultima_inspeccion: d(-30), proxima_inspeccion: d(60), created_at: d(-1500) + 'T00:00:00Z', cliente: { nombre: 'Cementos Andinos S.A.' } },
    { id: 'ie10', codigo: 'RED-010', nombre: 'Reductor molino de crudo', tipo: 'Reductor', marca: 'SEW', modelo: 'X3KS-190', numero_serie: 'SEW-2016-2280', cliente_id: 'c5', ubicacion: 'Molienda', fecha_puesta_servicio: d(-2400), estado: 'mantenimiento', criticidad: 'critica', horas_uso: 38900, potencia: '250 kW', ultima_inspeccion: d(-3), proxima_inspeccion: d(12), created_at: d(-2400) + 'T00:00:00Z', cliente: { nombre: 'Cementos Andinos S.A.' } },
  ],

  inspecciones: [
    {
      id: 'ins1', numero: 'INSP-2026-0001', equipo_id: 'ie1', tipo: 'preventiva', inspector: 'Carlos López',
      fecha: d(-25), resultado: 'aprobado', estado_resultante: 'operativo',
      observaciones: 'Equipo en excelente estado general. Se realizó lubricación de rodamientos y verificación de aislación. Todos los parámetros dentro de rango.',
      acciones_correctivas: 'Ninguna. Mantener plan de lubricación cada 90 días.',
      proxima_inspeccion: d(65), requiere_certificacion: false, condicion_operacion: 'En marcha',
      cliente_id: 'c1', created_at: d(-25) + 'T09:30:00Z',
      equipo: { codigo: 'MOT-001', nombre: 'Motor principal línea A' }, cliente: { nombre: 'Aceros del Sur S.A.' },
      checklist: buildChecklist(),
      mediciones: [
        { parametro: 'Temperatura de operación', valor: '62', unidad: '°C', rango: '< 75', estado: 'conforme' },
        { parametro: 'Nivel de vibración', valor: '2.8', unidad: 'mm/s', rango: '< 4.5', estado: 'conforme' },
        { parametro: 'Corriente de motor', valor: '52', unidad: 'A', rango: '≤ 58', estado: 'conforme' },
        { parametro: 'Resistencia de aislación', valor: '120', unidad: 'MΩ', rango: '> 1', estado: 'conforme' },
      ],
    },
    {
      id: 'ins2', numero: 'INSP-2026-0002', equipo_id: 'ie2', tipo: 'correctiva', inspector: 'Martín Rossi',
      fecha: d(-8), resultado: 'condicional', estado_resultante: 'operativo_obs',
      observaciones: 'Se detectó desgaste en sellos hidráulicos y una fuga menor en la línea de presión. Vibración levemente elevada en el sistema de bombeo.',
      acciones_correctivas: 'Reemplazar sellos hidráulicos (repuesto solicitado). Reapretar conexiones línea de presión. Reinspección en 7 días.',
      proxima_inspeccion: d(7), requiere_certificacion: false, condicion_operacion: 'Detenida',
      cliente_id: 'c1', created_at: d(-8) + 'T11:00:00Z',
      equipo: { codigo: 'PRE-002', nombre: 'Prensa hidráulica 200T' }, cliente: { nombre: 'Aceros del Sur S.A.' },
      checklist: buildChecklist(
        { '5.0': 'no_conforme', '5.3': 'observado', '2.4': 'observado' },
        { '5.0': 'Fuga menor en línea de presión', '5.3': 'Sellos con desgaste', '2.4': 'Vibración levemente elevada' }
      ),
      mediciones: [
        { parametro: 'Presión de trabajo', valor: '180', unidad: 'bar', rango: '190-210', estado: 'observado' },
        { parametro: 'Nivel de vibración', valor: '5.1', unidad: 'mm/s', rango: '< 4.5', estado: 'observado' },
        { parametro: 'Temperatura de operación', valor: '68', unidad: '°C', rango: '< 75', estado: 'conforme' },
      ],
    },
    {
      id: 'ins3', numero: 'INSP-2026-0003', equipo_id: 'ie4', tipo: 'certificacion', inspector: 'María García',
      fecha: d(-15), resultado: 'aprobado', estado_resultante: 'operativo',
      observaciones: 'Inspección reglamentaria de recipiente sometido a presión. Prueba hidráulica satisfactoria. Válvulas de seguridad calibradas y precintadas.',
      acciones_correctivas: 'Renovar habilitación ante organismo. Próxima prueba hidráulica según cronograma anual.',
      proxima_inspeccion: d(350), requiere_certificacion: true, condicion_operacion: 'Detenida',
      cliente_id: 'c2', created_at: d(-15) + 'T08:00:00Z',
      equipo: { codigo: 'CAL-004', nombre: 'Caldera de vapor' }, cliente: { nombre: 'Frigorifico Norte S.R.L.' },
      checklist: buildChecklist({ '3.3': 'observado' }, { '3.3': 'Reponer cartel de presión máxima' }),
      mediciones: [
        { parametro: 'Presión de trabajo', valor: '8.2', unidad: 'bar', rango: '≤ 10', estado: 'conforme' },
        { parametro: 'Espesor de pared', valor: '11.4', unidad: 'mm', rango: '> 9', estado: 'conforme' },
        { parametro: 'Temperatura de operación', valor: '174', unidad: '°C', rango: '< 185', estado: 'conforme' },
      ],
    },
    {
      id: 'ins4', numero: 'INSP-2026-0004', equipo_id: 'ie6', tipo: 'seguridad', inspector: 'Carlos López',
      fecha: d(-5), resultado: 'rechazado', estado_resultante: 'fuera_servicio',
      observaciones: 'Falla crítica detectada en el sistema de frenado del carro y desgaste severo en cable de izaje. El equipo NO debe operar hasta reparación.',
      acciones_correctivas: 'BLOQUEO Y ETIQUETADO del equipo. Reemplazo inmediato de cable de izaje y reparación del sistema de frenos. Certificación obligatoria antes de reingreso a servicio.',
      proxima_inspeccion: d(2), requiere_certificacion: true, condicion_operacion: 'Detenida',
      cliente_id: 'c3', created_at: d(-5) + 'T15:30:00Z',
      equipo: { codigo: 'PGR-006', nombre: 'Puente grúa 10T' }, cliente: { nombre: 'Química Industrial Patagonia' },
      checklist: buildChecklist(
        { '3.0': 'no_conforme', '3.1': 'no_conforme', '2.5': 'no_conforme', '0.4': 'observado' },
        { '3.0': 'Frenado del carro deficiente', '3.1': 'Parada de emergencia con respuesta lenta', '2.5': 'Cable de izaje con hilos rotos', '0.4': 'Revisar anclaje de viga testera' }
      ),
      mediciones: [
        { parametro: 'Desgaste cable de izaje', valor: '12', unidad: '%', rango: '< 10', estado: 'no_conforme' },
        { parametro: 'Distancia de frenado', valor: '0.9', unidad: 'm', rango: '< 0.5', estado: 'no_conforme' },
      ],
    },
    {
      id: 'ins5', numero: 'INSP-2026-0005', equipo_id: 'ie3', tipo: 'predictiva', inspector: 'Martín Rossi',
      fecha: d(-40), resultado: 'aprobado', estado_resultante: 'operativo',
      observaciones: 'Análisis de vibraciones y termografía sin novedades. Tendencia estable respecto a la medición anterior.',
      acciones_correctivas: 'Continuar con monitoreo predictivo trimestral.',
      proxima_inspeccion: d(50), requiere_certificacion: false, condicion_operacion: 'En marcha',
      cliente_id: 'c2', created_at: d(-40) + 'T10:15:00Z',
      equipo: { codigo: 'COM-003', nombre: 'Compresor de tornillo' }, cliente: { nombre: 'Frigorifico Norte S.R.L.' },
      checklist: buildChecklist({ '5.1': 'observado' }, { '5.1': 'Nivel de aceite en mínimo, completar' }),
      mediciones: [
        { parametro: 'Nivel de vibración', valor: '3.2', unidad: 'mm/s', rango: '< 4.5', estado: 'conforme' },
        { parametro: 'Temperatura de operación', valor: '71', unidad: '°C', rango: '< 80', estado: 'conforme' },
        { parametro: 'Presión de trabajo', valor: '7.5', unidad: 'bar', rango: '7-8', estado: 'conforme' },
      ],
    },
    {
      id: 'ins6', numero: 'INSP-2026-0006', equipo_id: 'ie9', tipo: 'preventiva', inspector: 'Carlos López',
      fecha: d(-30), resultado: 'aprobado', estado_resultante: 'operativo',
      observaciones: 'Mantenimiento preventivo de grupo electrógeno. Cambio de filtros y prueba de arranque automático satisfactoria.',
      acciones_correctivas: 'Ninguna. Programar prueba de carga en próxima visita.',
      proxima_inspeccion: d(60), requiere_certificacion: false, condicion_operacion: 'En prueba',
      cliente_id: 'c5', created_at: d(-30) + 'T09:00:00Z',
      equipo: { codigo: 'GEN-009', nombre: 'Grupo electrógeno' }, cliente: { nombre: 'Cementos Andinos S.A.' },
      checklist: buildChecklist(),
      mediciones: [
        { parametro: 'Tensión de generación', valor: '398', unidad: 'V', rango: '380-400', estado: 'conforme' },
        { parametro: 'Resistencia de aislación', valor: '85', unidad: 'MΩ', rango: '> 1', estado: 'conforme' },
      ],
    },
  ],

  insp_certificaciones: [
    { id: 'cert1', equipo_id: 'ie4', tipo: 'Habilitación recipiente a presión', entidad: 'IRAM', numero: 'RP-2026-1180', fecha_emision: d(-15), fecha_vencimiento: d(350), estado: 'vigente', created_at: d(-15) + 'T00:00:00Z', equipo: { codigo: 'CAL-004', nombre: 'Caldera de vapor' }, cliente: { nombre: 'Frigorifico Norte S.R.L.' } },
    { id: 'cert2', equipo_id: 'ie6', tipo: 'Certificación de aparato de izaje', entidad: 'Bureau Veritas', numero: 'IZ-2025-0442', fecha_emision: d(-380), fecha_vencimiento: d(-15), estado: 'vencido', created_at: d(-380) + 'T00:00:00Z', equipo: { codigo: 'PGR-006', nombre: 'Puente grúa 10T' }, cliente: { nombre: 'Química Industrial Patagonia' } },
    { id: 'cert3', equipo_id: 'ie1', tipo: 'Verificación de seguridad eléctrica', entidad: 'TÜV Rheinland', numero: 'SE-2026-0091', fecha_emision: d(-25), fecha_vencimiento: d(340), estado: 'vigente', created_at: d(-25) + 'T00:00:00Z', equipo: { codigo: 'MOT-001', nombre: 'Motor principal línea A' }, cliente: { nombre: 'Aceros del Sur S.A.' } },
    { id: 'cert4', equipo_id: 'ie7', tipo: 'Termografía de tablero (RETIE)', entidad: 'IRAM', numero: 'TG-2025-2231', fecha_emision: d(-90), fecha_vencimiento: d(25), estado: 'por_vencer', created_at: d(-90) + 'T00:00:00Z', equipo: { codigo: 'TAB-007', nombre: 'Tablero general BT' }, cliente: { nombre: 'Textil Pampa S.A.' } },
    { id: 'cert5', equipo_id: 'ie9', tipo: 'Puesta a tierra y descargas', entidad: 'Bureau Veritas', numero: 'PT-2026-0055', fecha_emision: d(-30), fecha_vencimiento: d(335), estado: 'vigente', created_at: d(-30) + 'T00:00:00Z', equipo: { codigo: 'GEN-009', nombre: 'Grupo electrógeno' }, cliente: { nombre: 'Cementos Andinos S.A.' } },
  ],

  insp_mantenimientos: [
    { id: 'man1', equipo_id: 'ie1', tipo: 'Preventivo', fecha: d(-25), descripcion: 'Lubricación de rodamientos y ajuste de bornera', responsable: 'Carlos López', costo: 45000, created_at: d(-25) + 'T00:00:00Z', equipo: { codigo: 'MOT-001', nombre: 'Motor principal línea A' } },
    { id: 'man2', equipo_id: 'ie2', tipo: 'Correctivo', fecha: d(-8), descripcion: 'Reemplazo de sellos hidráulicos y reapriete de líneas', responsable: 'Martín Rossi', costo: 128000, created_at: d(-8) + 'T00:00:00Z', equipo: { codigo: 'PRE-002', nombre: 'Prensa hidráulica 200T' } },
    { id: 'man3', equipo_id: 'ie10', tipo: 'Correctivo', fecha: d(-3), descripcion: 'Cambio de aceite y análisis de contaminación en reductor', responsable: 'Carlos López', costo: 210000, created_at: d(-3) + 'T00:00:00Z', equipo: { codigo: 'RED-010', nombre: 'Reductor molino de crudo' } },
    { id: 'man4', equipo_id: 'ie3', tipo: 'Preventivo', fecha: d(-40), descripcion: 'Cambio de filtros de aire y aceite del compresor', responsable: 'Martín Rossi', costo: 68000, created_at: d(-40) + 'T00:00:00Z', equipo: { codigo: 'COM-003', nombre: 'Compresor de tornillo' } },
    { id: 'man5', equipo_id: 'ie4', tipo: 'Predictivo', fecha: d(-15), descripcion: 'Prueba hidráulica y calibración de válvulas de seguridad', responsable: 'María García', costo: 95000, created_at: d(-15) + 'T00:00:00Z', equipo: { codigo: 'CAL-004', nombre: 'Caldera de vapor' } },
    { id: 'man6', equipo_id: 'ie9', tipo: 'Preventivo', fecha: d(-30), descripcion: 'Service de grupo electrógeno — filtros y prueba de arranque', responsable: 'Carlos López', costo: 82000, created_at: d(-30) + 'T00:00:00Z', equipo: { codigo: 'GEN-009', nombre: 'Grupo electrógeno' } },
  ],
}
