import { PageHeader } from '@/components/shared/PageHeader'
import { FileType } from 'lucide-react'
import { NewDocumentTypeForm } from '@/components/compliance/NewDocumentTypeForm'

export default function NuevoTipoPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Nuevo tipo de documento"
        description="Define un nuevo tipo de documento para compliance"
        icon={FileType}
        iconColor="bg-teal-600"
      />
      <NewDocumentTypeForm />
    </div>
  )
}
