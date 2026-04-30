'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleUserActive(userId: string, activo: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: perfil } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!perfil || perfil.rol !== 'admin_sismac') throw new Error('Sin permiso')

  const { error } = await supabase
    .from('usuarios')
    .update({ activo })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/usuarios')
}

export async function updateUserRole(userId: string, rol: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: perfil } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!perfil || perfil.rol !== 'admin_sismac') throw new Error('Sin permiso')

  const { error } = await supabase
    .from('usuarios')
    .update({ rol })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/usuarios')
}
