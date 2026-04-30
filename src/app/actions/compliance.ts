'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadDocumentSchema, createDocumentTypeSchema, createConsumanEntrySchema } from '@/lib/validations/compliance'

export async function uploadClientDocument(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = uploadDocumentSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('client_documents')
    .insert({ ...parsed.data, cargado_por: user.id, estado: 'pendiente_aprobacion' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/compliance/documentos')
  return data
}

export async function approveDocument(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('client_documents')
    .update({
      estado: 'vigente',
      aprobado_por: user.id,
      aprobado_en: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/compliance/documentos')
}

export async function renewDocument(oldId: string, formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = uploadDocumentSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  // Marcar el anterior como renovado
  await supabase.from('client_documents').update({ estado: 'renovado' }).eq('id', oldId)

  // Crear el nuevo con referencia al anterior
  const { error, data } = await supabase
    .from('client_documents')
    .insert({
      ...parsed.data,
      cargado_por: user.id,
      estado: 'pendiente_aprobacion',
      reemplaza_a: oldId,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/compliance/documentos')
  return data
}

export async function createDocumentType(formData: unknown) {
  const supabase = await createClient()
  const parsed = createDocumentTypeSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('document_types')
    .insert(parsed.data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/compliance/tipos')
  return data
}

export async function createConsumanEntry(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createConsumanEntrySchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('consuman_entries')
    .insert({ ...parsed.data, realizado_por: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/compliance')
  return data
}
