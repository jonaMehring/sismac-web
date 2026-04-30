import { z } from 'zod'

export const createExpenseSchema = z.object({
  descripcion: z.string().min(3).max(500),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  moneda: z.enum(['ARS', 'USD']).default('ARS'),
  tipo_cambio: z.number().optional().nullable(),
  fecha: z.string(),
  category_id: z.string().uuid().optional().nullable(),
  proveedor_id: z.string().uuid().optional().nullable(),
  cost_center_id: z.string().uuid().optional().nullable(),
  cliente_id: z.string().uuid().optional().nullable(),
  proceso_id: z.string().uuid().optional().nullable(),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro']).optional().nullable(),
  numero_comprobante: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
})

export const invoiceItemSchema = z.object({
  descripcion: z.string().min(1),
  unidad: z.string().optional().default('unidad'),
  cantidad: z.number().positive(),
  precio_unitario: z.number().positive(),
  proceso_id: z.string().uuid().optional().nullable(),
  orden: z.number().int().default(0),
})

export const createInvoiceSchema = z.object({
  cliente_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(['A', 'B', 'C', 'X', 'E']).default('B'),
  descripcion: z.string().min(1).optional().nullable(),
  iva_porcentaje: z.number().min(0).max(100).default(21),
  moneda: z.enum(['ARS', 'USD']).default('ARS'),
  fecha_emision: z.string(),
  fecha_vencimiento: z.string(),
  notas: z.string().optional().nullable(),
  condiciones_pago: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'Debe agregar al menos un ítem'),
})

export const budgetItemSchema = z.object({
  descripcion: z.string().min(1),
  unidad: z.string().optional().default('unidad'),
  cantidad: z.number().positive(),
  precio_unitario: z.number().positive(),
  descuento_porcentaje: z.number().min(0).max(100).default(0),
  orden: z.number().int().default(0),
})

export const createBudgetSchema = z.object({
  cliente_id: z.string().uuid().optional().nullable(),
  titulo: z.string().min(3).max(200),
  descripcion: z.string().optional().nullable(),
  proceso_id: z.string().uuid().optional().nullable(),
  iva_porcentaje: z.number().min(0).max(100).default(21),
  moneda: z.enum(['ARS', 'USD']).default('ARS'),
  fecha_emision: z.string(),
  fecha_validez: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
  condiciones: z.string().optional().nullable(),
  items: z.array(budgetItemSchema).min(1, 'Debe agregar al menos un ítem'),
})

export const updateBudgetSchema = createBudgetSchema.partial()

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type BudgetItemInput = z.infer<typeof budgetItemSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>
