import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { FileCheck } from 'lucide-react'
import { UploadDocumentForm } from '@/components/compliance/UploadDocumentForm'

export default async function NuevoDocumentoPage() {
  const supabase = await createClient()

  const [
    { data: clientes },
    { data: tiposDoc },
  ] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('document_types').select('id, nombre, alerta_dias_30, obligatorio').eq('activo', true).order('nombre'),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Cargar documento"
        description="Agrega documentación de un cliente con fecha de vencimiento"
        icon={FileCheck}
        iconColor="bg-teal-600"
      />
      <UploadDocumentForm
        clientes={clientes ?? []}
        tiposDoc={tiposDoc ?? []}
      />
    </div>
  )
}
