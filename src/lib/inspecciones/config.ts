// ============================================================
// Ingesar — Configuración del módulo de Inspecciones de Equipos
// ============================================================

export type ItemEstado = 'conforme' | 'observado' | 'no_conforme' | 'na'
export type InspeccionResultado = 'aprobado' | 'condicional' | 'rechazado'
export type EstadoResultante = 'operativo' | 'operativo_obs' | 'fuera_servicio'
export type TipoInspeccion =
  | 'preventiva' | 'correctiva' | 'predictiva' | 'certificacion' | 'seguridad' | 'puesta_marcha'
export type Criticidad = 'baja' | 'media' | 'alta' | 'critica'

// Plantilla del checklist técnico — categorías e ítems que abarca una inspección completa
export const CHECKLIST_TEMPLATE: { categoria: string; items: string[] }[] = [
  {
    categoria: 'Estado general y estructural',
    items: [
      'Integridad estructural general',
      'Corrosión / oxidación',
      'Fisuras, golpes o deformaciones',
      'Estado de pintura / recubrimiento',
      'Fijaciones, anclajes y soportes',
      'Limpieza general del equipo',
    ],
  },
  {
    categoria: 'Sistema eléctrico',
    items: [
      'Tablero y conexiones eléctricas',
      'Aislación de cables y conductores',
      'Puesta a tierra',
      'Protecciones (térmicas / disyuntores)',
      'Estado de motores eléctricos',
    ],
  },
  {
    categoria: 'Sistema mecánico',
    items: [
      'Rodamientos y bujes',
      'Lubricación',
      'Alineación y balanceo',
      'Transmisiones / correas / cadenas',
      'Ruidos y vibraciones anómalas',
      'Desgaste de componentes',
    ],
  },
  {
    categoria: 'Seguridad',
    items: [
      'Protecciones y resguardos',
      'Parada de emergencia',
      'Señalización y carteles',
      'Válvulas y dispositivos de seguridad',
      'EPP y elementos asociados',
    ],
  },
  {
    categoria: 'Instrumentación y control',
    items: [
      'Manómetros e indicadores',
      'Sensores y transmisores',
      'Estado de calibración',
      'Sistema de control / automatización',
    ],
  },
  {
    categoria: 'Fluidos y estanqueidad',
    items: [
      'Fugas de aceite / fluidos',
      'Niveles de fluido',
      'Presión de trabajo',
      'Estado de sellos y juntas',
    ],
  },
]

// Mediciones técnicas sugeridas (el inspector completa valor y define estado)
export const MEDICIONES_SUGERIDAS: { parametro: string; unidad: string; rango: string }[] = [
  { parametro: 'Temperatura de operación', unidad: '°C', rango: '< 75' },
  { parametro: 'Nivel de vibración', unidad: 'mm/s', rango: '< 4.5' },
  { parametro: 'Presión de trabajo', unidad: 'bar', rango: 'según equipo' },
  { parametro: 'Corriente de motor', unidad: 'A', rango: '≤ nominal' },
  { parametro: 'Resistencia de aislación', unidad: 'MΩ', rango: '> 1' },
  { parametro: 'Espesor de pared', unidad: 'mm', rango: '> mínimo' },
]

export const ITEM_ESTADO_META: Record<ItemEstado, { label: string; short: string; cls: string; dot: string }> = {
  conforme:    { label: 'Conforme',    short: 'C',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  observado:   { label: 'Observado',   short: 'O',   cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  no_conforme: { label: 'No conforme', short: 'NC',  cls: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500' },
  na:          { label: 'N/A',         short: 'N/A', cls: 'bg-slate-100 text-slate-500 border-slate-200',      dot: 'bg-slate-400' },
}

export const TIPO_INSPECCION_META: Record<TipoInspeccion, { label: string; cls: string }> = {
  preventiva:    { label: 'Preventiva',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  correctiva:    { label: 'Correctiva',      cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  predictiva:    { label: 'Predictiva',      cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  certificacion: { label: 'Certificación',   cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  seguridad:     { label: 'Seguridad',       cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  puesta_marcha: { label: 'Puesta en marcha', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export const RESULTADO_META: Record<InspeccionResultado, { label: string; cls: string; dot: string }> = {
  aprobado:    { label: 'Aprobado',              cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  condicional: { label: 'Aprobado condicional',  cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  rechazado:   { label: 'Rechazado',             cls: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500' },
}

export const ESTADO_RESULTANTE_META: Record<EstadoResultante, { label: string; cls: string }> = {
  operativo:       { label: 'Operativo',                cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  operativo_obs:   { label: 'Operativo con observaciones', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  fuera_servicio:  { label: 'Fuera de servicio',        cls: 'bg-red-50 text-red-700 border-red-200' },
}

export const EQUIPO_ESTADO_META: Record<string, { label: string; cls: string; dot: string }> = {
  operativo:      { label: 'Operativo',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  mantenimiento:  { label: 'En mantenimiento', cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  fuera_servicio: { label: 'Fuera de servicio', cls: 'bg-red-50 text-red-700 border-red-200',            dot: 'bg-red-500' },
  baja:           { label: 'Dado de baja',     cls: 'bg-slate-100 text-slate-500 border-slate-200',      dot: 'bg-slate-400' },
}

export const CRITICIDAD_META: Record<Criticidad, { label: string; cls: string }> = {
  baja:    { label: 'Baja',    cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  media:   { label: 'Media',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  alta:    { label: 'Alta',    cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  critica: { label: 'Crítica', cls: 'bg-red-50 text-red-700 border-red-200' },
}

// ── Cálculo automático del resultado (regla configurable) ──
// Regla: si hay algún "No conforme" → Rechazado; si hay algún "Observado" → Aprobado con
// observaciones; si todo es Conforme/N-A → Aprobado.
type EstadoLike = { estado: ItemEstado }
export function recolectarEstados(
  checklist: { items: EstadoLike[] }[] = [],
  mediciones: EstadoLike[] = [],
): ItemEstado[] {
  return [...checklist.flatMap(c => c.items.map(i => i.estado)), ...mediciones.map(m => m.estado)]
}

export function calcularResultado(
  checklist: { items: EstadoLike[] }[] = [],
  mediciones: EstadoLike[] = [],
): InspeccionResultado {
  const estados = recolectarEstados(checklist, mediciones)
  if (estados.includes('no_conforme')) return 'rechazado'
  if (estados.includes('observado')) return 'condicional'
  return 'aprobado'
}

export function calcularEstadoResultante(
  checklist: { items: EstadoLike[] }[] = [],
  mediciones: EstadoLike[] = [],
): EstadoResultante {
  const estados = recolectarEstados(checklist, mediciones)
  if (estados.includes('no_conforme')) return 'fuera_servicio'
  if (estados.includes('observado')) return 'operativo_obs'
  return 'operativo'
}

export const REGLA_RESULTADO_TEXTO =
  'Algún ítem "No conforme" → Rechazado · algún "Observado" → Aprobado con observaciones · todo conforme → Aprobado'

export const TIPOS_EQUIPO = [
  'Motor eléctrico', 'Bomba', 'Compresor', 'Caldera', 'Tablero eléctrico',
  'Puente grúa', 'Cinta transportadora', 'Reductor', 'Prensa', 'Torno / CNC',
  'Intercambiador de calor', 'Tanque / recipiente a presión', 'Ventilador / extractor',
  'Generador', 'Otro',
]
