import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatARS } from '@/lib/utils/currency'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { InvoiceStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'
import { InvoiceActions } from '@/components/finance/InvoiceActions'

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: factura } = await supabase
    .from('invoices')
    .select(`*, cliente:clientes(nombre, cuit, email), creador:usuarios!invoices_creado_por_fkey(nombre)`)
    .eq('id', id)
    .single()

  if (!factura) notFound()

  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('orden')

  const f = factura as typeof factura & {
    cliente?: { nombre: string; cuit?: string; email?: string } | null
    creador?: { nombre: string } | null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/finanzas/facturas" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Volver a facturas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Cabecera */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{f.numero}</h1>
                  <p className="text-sm text-slate-500">Factura tipo {f.tipo}</p>
                </div>
              </div>
              <InvoiceStatusBadge status={f.estado} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {f.cliente && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Cliente</p>
                  <p className="font-medium text-slate-800">{f.cliente.nombre}</p>
                  {f.cliente.cuit && <p className="text-xs text-slate-500">CUIT: {f.cliente.cuit}</p>}
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Emisión</p>
                <p className="font-medium text-slate-800">{formatDate(f.fecha_emision)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Vencimiento</p>
                <p className="font-medium text-slate-800">{formatDate(f.fecha_vencimiento)}</p>
                {f.estado !== 'cobrada' && f.estado !== 'anulada' && (
                  <div className="mt-1">
                    <VencimientoBadge dias={diasParaVencer(f.fecha_vencimiento)} />
                  </div>
                )}
              </div>
              {f.condiciones_pago && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Condiciones</p>
                  <p className="text-slate-600">{f.condiciones_pago}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ítems */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Descripción</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Cant.</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Precio unit.</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(items as unknown as Array<{ id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }> ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-700">{item.descripcion}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.cantidad}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatARS(item.precio_unitario)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{formatARS(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-sm text-slate-500">Subtotal</td>
                  <td className="px-4 py-2 text-right font-medium text-slate-700">{formatARS(f.subtotal)}</td>
                </tr>
                {f.iva_porcentaje > 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-slate-500">IVA ({f.iva_porcentaje}%)</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-700">{formatARS(f.iva_monto)}</td>
                  </tr>
                )}
                <tr className="bg-slate-50">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-800">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-lg text-slate-900">{formatARS(f.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {f.notas && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Notas</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{f.notas}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <InvoiceActions
            invoiceId={f.id}
            currentStatus={f.estado}
          />

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-sm">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Info</h2>
            {f.creador && (
              <div>
                <p className="text-xs text-slate-400">Creada por</p>
                <p className="font-medium text-slate-700">{f.creador.nombre}</p>
              </div>
            )}
            {f.fecha_cobro && (
              <div>
                <p className="text-xs text-slate-400">Cobrada el</p>
                <p className="font-medium text-slate-700">{formatDate(f.fecha_cobro)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
