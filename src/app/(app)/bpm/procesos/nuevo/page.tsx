import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { GitBranch } from 'lucide-react'
import { NewProcessForm } from '@/components/bpm/NewProcessForm'

export default async function NuevoProcesoPage() {
  const supabase = await createClient()

  const [{ data: clientes }, { data: templates }] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('process_templates').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Nuevo proceso"
        description="Inicia un proceso de trabajo"
        icon={GitBranch}
        iconColor="bg-blue-600"
      />
      <NewProcessForm
        clientes={clientes ?? []}
        templates={templates ?? []}
      />
    </div>
  )
}
