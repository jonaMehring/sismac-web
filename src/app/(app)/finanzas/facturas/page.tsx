import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatARS } from '@/lib/utils/currency'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { InvoiceStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'
import type { Invoice } from '@/lib/types'

export default async function FacturasPage() {
  const supabase = await createClient()

  const { data: facturas } = await supabase
    .from('invoices')
    .select(`*, cliente:clientes(nombre)`)
    .order('fecha_emision', { ascending: false })
    .limit(50)

  return (
    <div>
      <PageHeader
        title="Facturas"
        description="Registro y seguimiento de facturación"
        icon={FileText}
        iconColor="bg-blue-600"
        actions={
          <Link href="/finanzas/facturas/nueva" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Nueva factura
          </Link>
        }
      />

      {(facturas ?? []).length === 0 ? (
        <EmptyState icon={FileText} title="Sin facturas" description="Crea la primera factura" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Número</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Emisión</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Vencimiento</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(facturas as unknown as (Invoice & { cliente?: { nombre: string } })[]).map(f => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/finanzas/facturas/${f.id}`} className="font-medium text-blue-600 hover:underline">
                      {f.numero}
                    </Link>
                    <p className="text-xs text-slate-400">Tipo {f.tipo}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{f.cliente?.nombre}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatARS(f.total)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{formatDate(f.fecha_emision)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {f.estado !== 'cobrada' && f.estado !== 'anulada' ? (
                      <VencimientoBadge dias={diasParaVencer(f.fecha_vencimiento)} />
                    ) : (
                      <span className="text-xs text-slate-400">{formatDate(f.fecha_vencimiento)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><InvoiceStatusBadge status={f.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
