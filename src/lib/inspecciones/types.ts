import type {
  ItemEstado, InspeccionResultado, EstadoResultante, TipoInspeccion, Criticidad,
} from './config'

export type { ItemEstado, InspeccionResultado, EstadoResultante, TipoInspeccion, Criticidad }

export type EquipoEstado = 'operativo' | 'mantenimiento' | 'fuera_servicio' | 'baja'

export interface InspEquipo {
  id: string
  codigo: string
  nombre: string
  tipo: string
  marca?: string | null
  modelo?: string | null
  numero_serie?: string | null
  cliente_id: string
  ubicacion?: string | null
  fecha_puesta_servicio?: string | null
  anio?: number | null
  patente?: string | null
  foto?: string | null
  estado: EquipoEstado
  criticidad: Criticidad
  horas_uso?: number | null
  potencia?: string | null
  observaciones?: string | null
  ultima_inspeccion?: string | null
  proxima_inspeccion?: string | null
  created_at: string
  cliente?: { nombre: string } | null
}

export interface InspFoto {
  url: string
  punto?: string | null
  descripcion?: string | null
}

export interface ChecklistItem {
  nombre: string
  estado: ItemEstado
  nota?: string
}
export interface ChecklistCategoria {
  categoria: string
  items: ChecklistItem[]
}
export interface Medicion {
  parametro: string
  valor: string
  unidad: string
  rango?: string
  estado: ItemEstado
}

export interface Inspeccion {
  id: string
  numero: string
  equipo_id: string
  tipo: TipoInspeccion
  inspector: string
  fecha: string
  lugar?: string | null
  resultado: InspeccionResultado
  estado_resultante: EstadoResultante
  observaciones?: string | null
  acciones_correctivas?: string | null
  proxima_inspeccion?: string | null
  requiere_certificacion?: boolean
  condicion_operacion?: string | null
  cliente_id?: string | null
  created_at: string
  checklist?: ChecklistCategoria[]
  mediciones?: Medicion[]
  fotos?: InspFoto[]
  equipo?: { codigo: string; nombre: string } | null
  cliente?: { nombre: string } | null
}

export interface Certificacion {
  id: string
  equipo_id: string
  tipo: string
  entidad: string
  numero: string
  fecha_emision: string
  fecha_vencimiento: string
  estado: 'vigente' | 'por_vencer' | 'vencido'
  created_at: string
  equipo?: { codigo: string; nombre: string } | null
  cliente?: { nombre: string } | null
}

export interface Mantenimiento {
  id: string
  equipo_id: string
  tipo: string
  fecha: string
  descripcion: string
  responsable: string
  costo?: number | null
  created_at: string
  equipo?: { codigo: string; nombre: string } | null
}
