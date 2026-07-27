import { z } from 'zod'

export const createEquipoSchema = z.object({
  codigo: z.string().min(1, 'El código/TAG es obligatorio'),
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  numero_serie: z.string().optional().nullable(),
  cliente_id: z.string().min(1, 'Seleccioná un cliente'),
  ubicacion: z.string().optional().nullable(),
  fecha_puesta_servicio: z.string().optional().nullable(),
  estado: z.enum(['operativo', 'mantenimiento', 'fuera_servicio', 'baja']),
  criticidad: z.enum(['baja', 'media', 'alta', 'critica']),
  potencia: z.string().optional().nullable(),
  horas_uso: z.number().optional().nullable(),
})

const checklistItemSchema = z.object({
  nombre: z.string(),
  estado: z.enum(['conforme', 'observado', 'no_conforme', 'na']),
  nota: z.string().optional().default(''),
})
const checklistCategoriaSchema = z.object({
  categoria: z.string(),
  items: z.array(checklistItemSchema),
})
const medicionSchema = z.object({
  parametro: z.string(),
  valor: z.string(),
  unidad: z.string().optional().default(''),
  rango: z.string().optional().default(''),
  estado: z.enum(['conforme', 'observado', 'no_conforme', 'na']),
})

export const createInspeccionSchema = z.object({
  equipo_id: z.string().min(1, 'Seleccioná el equipo a inspeccionar'),
  tipo: z.enum(['preventiva', 'correctiva', 'predictiva', 'certificacion', 'seguridad', 'puesta_marcha']),
  inspector: z.string().min(2, 'Indicá el inspector responsable'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  condicion_operacion: z.string().optional().nullable(),
  resultado: z.enum(['aprobado', 'condicional', 'rechazado']),
  estado_resultante: z.enum(['operativo', 'operativo_obs', 'fuera_servicio']),
  observaciones: z.string().optional().nullable(),
  acciones_correctivas: z.string().optional().nullable(),
  proxima_inspeccion: z.string().optional().nullable(),
  requiere_certificacion: z.boolean().optional().default(false),
  checklist: z.array(checklistCategoriaSchema),
  mediciones: z.array(medicionSchema),
})

export type CreateEquipoInput = z.infer<typeof createEquipoSchema>
export type CreateInspeccionInput = z.infer<typeof createInspeccionSchema>
