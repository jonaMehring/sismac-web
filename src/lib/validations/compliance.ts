import { z } from 'zod'

export const uploadDocumentSchema = z.object({
  cliente_id: z.string().uuid(),
  document_type_id: z.string().uuid(),
  nombre_archivo: z.string().min(1),
  archivo_url: z.string().url().optional().nullable(),
  fecha_emision: z.string().optional().nullable(),
  fecha_vencimiento: z.string(),
  notas: z.string().optional().nullable(),
  numero_documento: z.string().optional().nullable(),
  organismo_emisor: z.string().optional().nullable(),
})

export const createDocumentTypeSchema = z.object({
  nombre: z.string().min(3).max(200),
  descripcion: z.string().optional(),
  alerta_dias_30: z.boolean().default(true),
  alerta_dias_15: z.boolean().default(true),
  alerta_dias_7: z.boolean().default(true),
  alerta_dias_1: z.boolean().default(true),
  obligatorio: z.boolean().default(true),
  aplica_a: z.enum(['empresa', 'persona', 'equipo']).default('empresa'),
})

export const createConsumanEntrySchema = z.object({
  cliente_id: z.string().uuid(),
  equipo_id: z.string().uuid().optional().nullable(),
  sector_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(['mantenimiento_preventivo', 'mantenimiento_correctivo', 'inspeccion', 'certificacion', 'reemplazo', 'capacitacion', 'incidente', 'otro']),
  titulo: z.string().min(3).max(300),
  descripcion: z.string().optional().nullable(),
  fecha: z.string(),
  proxima_revision: z.string().optional().nullable(),
  costo: z.number().positive().optional().nullable(),
  observaciones: z.string().optional().nullable(),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>
export type CreateDocumentTypeInput = z.infer<typeof createDocumentTypeSchema>
export type CreateConsumanEntryInput = z.infer<typeof createConsumanEntrySchema>
