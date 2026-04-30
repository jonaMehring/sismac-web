import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Receipt } from 'lucide-react'
import { NewExpenseForm } from '@/components/finance/NewExpenseForm'

export default async function NuevoGastoPage() {
  const supabase = await createClient()

  const [
    { data: categorias },
    { data: proveedores },
    { data: clientes },
    { data: centros },
  ] = await Promise.all([
    supabase.from('expense_categories').select('id, nombre, color').order('nombre'),
    supabase.from('proveedores').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('cost_centers').select('id, codigo, nombre').order('codigo'),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Registrar gasto"
        description="Agrega un nuevo gasto operativo"
        icon={Receipt}
        iconColor="bg-red-600"
      />
      <NewExpenseForm
        categorias={categorias ?? []}
        proveedores={proveedores ?? []}
        clientes={clientes ?? []}
        centros={centros ?? []}
      />
    </div>
  )
}
