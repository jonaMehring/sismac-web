'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createEquipoSchema, createInspeccionSchema } from '@/lib/validations/inspecciones'

export async function createEquipo(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createEquipoSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  // Nombre de cliente para mostrar en listas
  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', parsed.data.cliente_id).single()

  const { error, data } = await supabase
    .from('insp_equipos')
    .insert({
      ...parsed.data,
      ultima_inspeccion: null,
      proxima_inspeccion: null,
      cliente: cliente ? { nombre: cliente.nombre } : null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/inspecciones')
  return data
}

export async function createInspeccion(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createInspeccionSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  // Datos del equipo para anidar en la inspección
  const { data: equipo } = await supabase
    .from('insp_equipos')
    .select('codigo, nombre, cliente_id, cliente')
    .eq('id', parsed.data.equipo_id)
    .single()

  // Número correlativo
  const { data: existentes } = await supabase.from('inspecciones').select('id')
  const numero = `INSP-${new Date().getFullYear()}-${String(((existentes?.length ?? 0) + 1)).padStart(4, '0')}`

  const { error, data } = await supabase
    .from('inspecciones')
    .insert({
      ...parsed.data,
      numero,
      cliente_id: equipo?.cliente_id ?? null,
      equipo: equipo ? { codigo: equipo.codigo, nombre: equipo.nombre } : null,
      cliente: equipo?.cliente ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Actualizar estado del equipo según resultado (best-effort en demo)
  const nuevoEstado = parsed.data.estado_resultante === 'fuera_servicio'
    ? 'fuera_servicio'
    : parsed.data.estado_resultante === 'operativo_obs'
      ? 'mantenimiento'
      : 'operativo'
  await supabase.from('insp_equipos')
    .update({ estado: nuevoEstado, ultima_inspeccion: parsed.data.fecha, proxima_inspeccion: parsed.data.proxima_inspeccion })
    .eq('id', parsed.data.equipo_id)

  revalidatePath('/inspecciones')
  return data
}
