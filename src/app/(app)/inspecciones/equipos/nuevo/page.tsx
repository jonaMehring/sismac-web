import { createClient } from '@/lib/supabase/server'
import { NewEquipoForm } from '@/components/inspecciones/NewEquipoForm'

export default async function NuevoEquipoPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre')
  return <NewEquipoForm clientes={(clientes ?? []) as unknown as { id: string; nombre: string }[]} />
}
