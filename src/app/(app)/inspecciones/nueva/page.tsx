import { createClient } from '@/lib/supabase/server'
import { InspeccionForm } from '@/components/inspecciones/InspeccionForm'
import type { InspEquipo } from '@/lib/inspecciones/types'

export default async function NuevaInspeccionPage({
  searchParams,
}: {
  searchParams: Promise<{ equipo?: string }>
}) {
  const { equipo } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = user
    ? await supabase.from('usuarios').select('nombre').eq('id', user.id).single()
    : { data: null }
  const inspectorDefault = (perfil as { nombre?: string } | null)?.nombre ?? 'Inspector'

  const { data: equipos } = await supabase.from('insp_equipos').select('*').neq('estado', 'baja').order('codigo')

  return (
    <InspeccionForm
      equipos={(equipos ?? []) as unknown as InspEquipo[]}
      inspectorDefault={inspectorDefault}
      equipoPreset={equipo}
    />
  )
}
