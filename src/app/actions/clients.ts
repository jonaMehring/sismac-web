'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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
