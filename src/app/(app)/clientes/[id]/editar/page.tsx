import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EditClienteForm } from '@/components/clientes/EditClienteForm'
import type { Cliente } from '@/lib/types'

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cliente } = await supabase.from('clientes').select('*').eq('id', id).single()
  if (!cliente) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href={`/clientes/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al cliente
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Editar cliente</h1>
        <p className="text-sm text-slate-500 mt-1">{cliente.nombre}</p>
      </div>
      <EditClienteForm cliente={cliente as unknown as Cliente} />
    </div>
  )
}
