'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createExpenseSchema, createInvoiceSchema, createBudgetSchema } from '@/lib/validations/finance'
import { calcularSubtotal } from '@/lib/utils/currency'

// ============================================================
// GASTOS
// ============================================================
export async function createExpense(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createExpenseSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('expenses')
    .insert({ ...parsed.data, creado_por: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/gastos')
  return data
}

export async function approveExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('expenses')
    .update({ estado: 'aprobado', aprobado_por: user.id, aprobado_en: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/gastos')
}

export async function rejectExpense(id: string, motivo: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .update({ estado: 'rechazado', motivo_rechazo: motivo })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/gastos')
}

// ============================================================
// FACTURAS
// ============================================================
export async function createInvoice(formData: unknown) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createInvoiceSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { data: numData } = await admin.rpc('generate_invoice_number')
  const numero = numData ?? `FAC-${Date.now()}`

  const subtotal = parsed.data.items.reduce((sum, item) => sum + calcularSubtotal(item.cantidad, item.precio_unitario), 0)
  const iva_monto = subtotal * (parsed.data.iva_porcentaje / 100)
  const total = subtotal + iva_monto

  const { error: invError, data: invoice } = await supabase
    .from('invoices')
    .insert({
      numero,
      tipo: parsed.data.tipo,
      cliente_id: parsed.data.cliente_id,
      descripcion: parsed.data.descripcion,
      subtotal,
      iva_porcentaje: parsed.data.iva_porcentaje,
      iva_monto,
      total,
      moneda: parsed.data.moneda,
      fecha_emision: parsed.data.fecha_emision,
      fecha_vencimiento: parsed.data.fecha_vencimiento,
      notas: parsed.data.notas,
      condiciones_pago: parsed.data.condiciones_pago,
      creado_por: user.id,
      estado: 'emitida',
    })
    .select()
    .single()

  if (invError) throw new Error(invError.message)

  const items = parsed.data.items.map((item, i) => ({
    invoice_id: invoice.id,
    descripcion: item.descripcion,
    unidad: item.unidad,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: calcularSubtotal(item.cantidad, item.precio_unitario),
    proceso_id: item.proceso_id ?? null,
    orden: i,
  }))

  await supabase.from('invoice_items').insert(items)

  revalidatePath('/finanzas/facturas')
  return invoice
}

export async function markInvoicePaid(id: string, fecha_cobro: string, metodo_cobro: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({ estado: 'cobrada', fecha_cobro, metodo_cobro })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/facturas')
  revalidatePath(`/finanzas/facturas/${id}`)
}

export async function voidInvoice(id: string, motivo: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({ estado: 'anulada', motivo_anulacion: motivo })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/facturas')
}

// ============================================================
// PRESUPUESTOS
// ============================================================
export async function createBudget(formData: unknown) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createBudgetSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { data: numData } = await admin.rpc('generate_budget_number')
  const numero = numData ?? `PRES-${Date.now()}`

  const subtotal = parsed.data.items.reduce(
    (sum, item) => sum + calcularSubtotal(item.cantidad, item.precio_unitario, item.descuento_porcentaje ?? 0),
    0
  )
  const iva_monto = subtotal * (parsed.data.iva_porcentaje / 100)
  const total = subtotal + iva_monto

  const { error, data: budget } = await supabase
    .from('budgets')
    .insert({
      numero,
      cliente_id: parsed.data.cliente_id,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion,
      proceso_id: parsed.data.proceso_id ?? null,
      iva_porcentaje: parsed.data.iva_porcentaje,
      iva_monto,
      subtotal,
      total,
      moneda: parsed.data.moneda,
      fecha_emision: parsed.data.fecha_emision,
      fecha_validez: parsed.data.fecha_validez ?? null,
      notas: parsed.data.notas ?? null,
      condiciones: parsed.data.condiciones ?? null,
      creado_por: user.id,
      estado: 'borrador',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const items = parsed.data.items.map((item, i) => ({
    budget_id: budget.id,
    descripcion: item.descripcion,
    unidad: item.unidad,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    descuento_porcentaje: item.descuento_porcentaje ?? 0,
    subtotal: calcularSubtotal(item.cantidad, item.precio_unitario, item.descuento_porcentaje ?? 0),
    orden: i,
  }))

  await supabase.from('budget_items').insert(items)

  revalidatePath('/finanzas/presupuestos')
  return budget
}

export async function approveBudget(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('budgets')
    .update({ estado: 'aprobado', aprobado_por: user.id, fecha_aprobacion: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/presupuestos')
}

export async function rejectBudget(id: string, motivo: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('budgets')
    .update({ estado: 'rechazado', motivo_rechazo: motivo })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/presupuestos')
}

export async function convertBudgetToInvoice(budgetId: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: budget } = await supabase
    .from('budgets')
    .select('*, items:budget_items(*)')
    .eq('id', budgetId)
    .single()

  if (!budget) throw new Error('Presupuesto no encontrado')
  if (budget.estado !== 'aprobado') throw new Error('Solo se pueden convertir presupuestos aprobados')

  const { data: numData } = await admin.rpc('generate_invoice_number')
  const numero = numData ?? `FAC-${Date.now()}`

  const fechaVenc = new Date()
  fechaVenc.setDate(fechaVenc.getDate() + 30)

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      numero,
      tipo: 'B',
      cliente_id: budget.cliente_id,
      descripcion: budget.titulo,
      subtotal: budget.subtotal,
      iva_porcentaje: budget.iva_porcentaje,
      iva_monto: budget.iva_monto,
      total: budget.total,
      moneda: budget.moneda,
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_vencimiento: fechaVenc.toISOString().split('T')[0],
      creado_por: user.id,
      estado: 'emitida',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const items = (budget.items ?? []).map((item: { descripcion: string; unidad?: string; cantidad: number; precio_unitario: number; subtotal: number; orden: number }) => ({
    invoice_id: invoice.id,
    descripcion: item.descripcion,
    unidad: item.unidad,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.subtotal,
    orden: item.orden,
  }))

  await supabase.from('invoice_items').insert(items)
  await supabase.from('budgets').update({ estado: 'convertido', invoice_id: invoice.id }).eq('id', budgetId)

  revalidatePath('/finanzas/presupuestos')
  revalidatePath('/finanzas/facturas')
  return invoice
}
