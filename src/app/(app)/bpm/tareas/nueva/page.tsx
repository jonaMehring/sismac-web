import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { CheckSquare } from 'lucide-react'
import { NewTaskForm } from '@/components/bpm/NewTaskForm'

export default async function NuevaTareaPage() {
  const supabase = await createClient()

  const [
    { data: clientes },
    { data: usuarios },
    { data: processes },
  ] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('usuarios').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('processes').select('id, nombre').eq('estado', 'activo').order('nombre'),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Nueva tarea"
        description="Crea y asigna una nueva tarea"
        icon={CheckSquare}
        iconColor="bg-blue-600"
      />
      <NewTaskForm
        clientes={clientes ?? []}
        usuarios={usuarios ?? []}
        processes={processes ?? []}
      />
    </div>
  )
}
