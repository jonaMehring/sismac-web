import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { diasParaVencer, formatDate } from '@/lib/utils/dates'
import { VencimientoBadge, DocumentStatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils/cn'
import type { ClientDocument } from '@/lib/types'

export default async function CompliancePage() {
  const supabase = await createClient()

  const { data: docs } = await supabase
    .from('client_documents')
    .select(`
      *,
      cliente:clientes(id, nombre),
      document_type:document_types(nombre)
    `)
    .neq('estado', 'renovado')
    .order('fecha_vencimiento')

  const allDocs = (docs ?? []) as unknown as (ClientDocument & {
    cliente: { id: string; nombre: string } | null
    document_type: { nombre: string } | null
    dias_para_vencer?: number
  })[]

  // Clasificar
  const vencidos = allDocs.filter(d => diasParaVencer(d.fecha_vencimiento) < 0)
  const porVencer7 = allDocs.filter(d => { const dias = diasParaVencer(d.fecha_vencimiento); return dias >= 0 && dias <= 7 })
  const porVencer30 = allDocs.filter(d => { const dias = diasParaVencer(d.fecha_vencimiento); return dias > 7 && dias <= 30 })
  const vigentes = allDocs.filter(d => diasParaVencer(d.fecha_vencimiento) > 30 && d.estado === 'vigente')

  // Clientes únicos en riesgo
  const clientesRiesgo = new Set(vencidos.map(d => d.cliente_id))
  const clientesAlerta = new Set([...porVencer7].map(d => d.cliente_id))
  const totalClientes = new Set(allDocs.map(d => d.cliente_id)).size
  const clientesSeguros = totalClientes - clientesRiesgo.size - clientesAlerta.size

  return (
    <div>
      <PageHeader
        title="Compliance"
        description="Control de documentación y vencimientos"
        icon={Shield}
        iconColor="bg-green-600"
        actions={
          <Link href="/compliance/documentos/nuevo" className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            + Cargar documento
          </Link>
        }
      />

      {/* Semáforo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link href="/compliance/documentos?estado=vencido" className={cn(
          'bg-red-50 border-2 border-red-200 rounded-xl p-5 text-center cursor-pointer hover:bg-red-100 transition-colors',
          vencidos.length === 0 && 'opacity-40 cursor-default pointer-events-none'
        )}>
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-red-700">{clientesRiesgo.size}</p>
          <p className="text-sm font-medium text-red-600 mt-1">Clientes en riesgo</p>
          <p className="text-xs text-red-400 mt-0.5">{vencidos.length} doc. vencido{vencidos.length !== 1 ? 's' : ''}</p>
        </Link>
        <Link href="/compliance/documentos?estado=por_vencer" className={cn(
          'bg-orange-50 border-2 border-orange-200 rounded-xl p-5 text-center cursor-pointer hover:bg-orange-100 transition-colors',
          clientesAlerta.size === 0 && 'opacity-40 cursor-default pointer-events-none'
        )}>
          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-orange-700">{clientesAlerta.size}</p>
          <p className="text-sm font-medium text-orange-600 mt-1">Clientes con alertas</p>
          <p className="text-xs text-orange-400 mt-0.5">{porVencer7.length} doc. vencen en 7 días</p>
        </Link>
        <div className={cn(
          'bg-green-50 border-2 border-green-200 rounded-xl p-5 text-center',
        )}>
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-700">{clientesSeguros}</p>
          <p className="text-sm font-medium text-green-600 mt-1">Clientes al día</p>
          <p className="text-xs text-green-400 mt-0.5">{vigentes.length} doc. vigente{vigentes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Próximos vencimientos */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Vencimientos próximos</h2>
          <Link href="/compliance/calendario" className="text-sm text-blue-600 hover:underline">Ver calendario</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Documento</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Vencimiento</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tiempo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...vencidos, ...porVencer7, ...porVencer30].slice(0, 20).map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{doc.cliente?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{doc.document_type?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(doc.fecha_vencimiento)}</td>
                  <td className="px-4 py-3"><DocumentStatusBadge status={doc.estado} /></td>
                  <td className="px-4 py-3">
                    <VencimientoBadge dias={diasParaVencer(doc.fecha_vencimiento)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/compliance/documentos/${doc.id}`} className="text-xs text-blue-600 hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {[...vencidos, ...porVencer7, ...porVencer30].length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    No hay vencimientos próximos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
