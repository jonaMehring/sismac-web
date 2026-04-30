import { z } from 'zod'

export const createTaskSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  descripcion: z.string().optional(),
  estado: z.enum(['pendiente', 'en_curso', 'en_revision', 'completada', 'cancelada', 'demorada']).default('pendiente'),
  prioridad: z.enum(['baja', 'normal', 'alta', 'critica']).default('normal'),
  asignado_a: z.string().uuid().optional().nullable(),
  cliente_id: z.string().uuid().optional().nullable(),
  process_id: z.string().uuid().optional().nullable(),
  fecha_limite: z.string().datetime().optional().nullable(),
  estimacion_horas: z.number().min(0).max(999).optional().nullable(),
  parent_task_id: z.string().uuid().optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  horas_reales: z.number().min(0).max(999).optional().nullable(),
})

export const changeTaskStatusSchema = z.object({
  id: z.string().uuid(),
  estado: z.enum(['pendiente', 'en_curso', 'en_revision', 'completada', 'cancelada', 'demorada']),
})

export const addCommentSchema = z.object({
  task_id: z.string().uuid(),
  contenido: z.string().min(1, 'El comentario no puede estar vacío').max(2000),
})

export const createProcessSchema = z.object({
  nombre: z.string().min(3).max(200),
  descripcion: z.string().optional(),
  template_id: z.string().uuid().optional().nullable(),
  cliente_id: z.string().uuid().optional().nullable(),
  prioridad: z.enum(['baja', 'normal', 'alta', 'critica']).default('normal'),
  fecha_inicio: z.string(),
  fecha_limite: z.string().optional().nullable(),
})

export const createTemplateSchema = z.object({
  nombre: z.string().min(3).max(200),
  descripcion: z.string().optional(),
  categoria: z.enum(['mantenimiento', 'administrativo', 'compliance', 'ventas', 'otro']).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CreateProcessInput = z.infer<typeof createProcessSchema>
