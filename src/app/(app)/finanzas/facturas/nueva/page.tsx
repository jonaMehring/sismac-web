import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { FileText } from 'lucide-react'
import { NewInvoiceForm } from '@/components/finance/NewInvoiceForm'

export default async function NuevaFacturaPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Nueva factura"
        description="Crea una factura con ítems y condiciones"
        icon={FileText}
        iconColor="bg-blue-600"
      />
      <NewInvoiceForm clientes={clientes ?? []} />
    </div>
  )
}
