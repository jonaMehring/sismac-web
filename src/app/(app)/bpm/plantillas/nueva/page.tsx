import { PageHeader } from '@/components/shared/PageHeader'
import { LayoutTemplate } from 'lucide-react'
import { NewTemplateForm } from '@/components/bpm/NewTemplateForm'

export default function NuevaPlantillaPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Nueva plantilla"
        description="Define un modelo de proceso reutilizable"
        icon={LayoutTemplate}
        iconColor="bg-purple-600"
      />
      <NewTemplateForm />
    </div>
  )
}
