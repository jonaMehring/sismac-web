import { PageHeader } from '@/components/shared/PageHeader'
import { Building2 } from 'lucide-react'
import { NewClienteForm } from '@/components/admin/NewClienteForm'

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Nuevo cliente"
        description="Registra un nuevo cliente en el sistema"
        icon={Building2}
        iconColor="bg-indigo-600"
      />
      <NewClienteForm />
    </div>
  )
}
