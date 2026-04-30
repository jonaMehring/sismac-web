import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileCheck, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { DocumentStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'
import type { ClientDocument } from '@/lib/types'

export default async function DocumentosPage() {
  const supabase = await createClient()

  const { data: docs } = await supabase
    .from('client_documents')
    .select(`
      *,
      cliente:clientes(nombre),
      document_type:document_types(nombre)
    `)
    .neq('estado', 'renovado')
    .order('fecha_vencimiento')
    .limit(100)

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Control de documentación por cliente"
        icon={FileCheck}
        iconColor="bg-teal-600"
        actions={
          <Link href="/compliance/documentos/nuevo" className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Cargar documento
          </Link>
        }
      />

      {(docs ?? []).length === 0 ? (
        <EmptyState icon={FileCheck} title="Sin documentos" description="Carga el primer documento de un cliente" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tipo de documento</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Archivo</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Vencimiento</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Tiempo</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(docs as unknown as (ClientDocument & { cliente?: { nombre: string }; document_type?: { nombre: string } })[]).map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.cliente?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{d.document_type?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{d.nombre_archivo}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{formatDate(d.fecha_vencimiento)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <VencimientoBadge dias={diasParaVencer(d.fecha_vencimiento)} />
                  </td>
                  <td className="px-4 py-3"><DocumentStatusBadge status={d.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/compliance/documentos/${d.id}`} className="text-xs text-blue-600 hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
