'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSectorSchema, createEquipoSchema, createContactoSchema } from '@/lib/validations/clients'

const clienteSchema = z.object({
  nombre: z.string().min(2).max(200),
  razon_social: z.string().optional().nullable(),
  cuit: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  localidad: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  contacto_nombre: z.string().optional().nullable(),
  contacto_email: z.string().email().optional().nullable(),
  contacto_telefono: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
})

export async function createCliente(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = clienteSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('clientes')
    .insert({ ...parsed.data, activo: true })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
  return data
}

export async function updateCliente(id: string, formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = clienteSchema.partial().safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error } = await supabase
    .from('clientes')
    .update(parsed.data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
}

// ─── SECTORES ────────────────────────────────────────────────

export async function createSector(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createSectorSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('sectores')
    .insert(parsed.data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/clientes/${parsed.data.cliente_id}`)
  return data
}

export async function updateSector(id: string, formData: unknown) {
  const supabase = await createClient()
  const parsed = createSectorSchema.partial().safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('sectores')
    .update(parsed.data)
    .eq('id', id)
    .select('cliente_id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/clientes/${data?.cliente_id}`)
}

// ─── EQUIPOS ─────────────────────────────────────────────────

export async function createEquipo(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createEquipoSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('equipos')
    .insert(parsed.data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateEquipo(id: string, formData: unknown) {
  const supabase = await createClient()
  const parsed = createEquipoSchema.partial().safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error } = await supabase
    .from('equipos')
    .update(parsed.data)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── CONTACTOS ───────────────────────────────────────────────

export async function createContacto(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createContactoSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const cleanData = { ...parsed.data, email: parsed.data.email || null }

  const { error, data } = await supabase
    .from('cliente_contactos')
    .insert(cleanData)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/clientes/${parsed.data.cliente_id}`)
  return data
}

export async function deleteContacto(id: string, clienteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('cliente_contactos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/clientes/${clienteId}`)
}
