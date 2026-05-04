import { z } from 'zod'

export const createSectorSchema = z.object({
  cliente_id: z.string().uuid(),
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  descripcion: z.string().optional(),
  ubicacion: z.string().optional(),
})

export const createEquipoSchema = z.object({
  sector_id: z.string().uuid(),
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  modelo: z.string().optional(),
  marca: z.string().optional(),
  numero_serie: z.string().optional(),
  estado: z.enum(['operativo', 'mantenimiento', 'fuera_servicio', 'baja']).default('operativo'),
  proxima_revision: z.string().optional().nullable(),
  notas: z.string().optional(),
})

export const createContactoSchema = z.object({
  cliente_id: z.string().uuid(),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  cargo: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  es_principal: z.boolean().default(false),
  notas: z.string().optional(),
})

export type CreateSectorInput = z.infer<typeof createSectorSchema>
export type CreateEquipoInput = z.infer<typeof createEquipoSchema>
export type CreateContactoInput = z.infer<typeof createContactoSchema>
