import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { ClipboardList } from 'lucide-react'
import { NewBudgetForm } from '@/components/finance/NewBudgetForm'

export default async function NuevoPresupuestoPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Nuevo presupuesto"
        description="Crea un presupuesto con líneas de servicio/producto"
        icon={ClipboardList}
        iconColor="bg-purple-600"
      />
      <NewBudgetForm clientes={clientes ?? []} />
    </div>
  )
}
