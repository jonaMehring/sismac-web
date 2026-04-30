import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatARS } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { BudgetStatusBadge } from '@/components/shared/StatusBadge'
import { BudgetActions } from '@/components/finance/BudgetActions'

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: budget } = await supabase
    .from('budgets')
    .select(`*, cliente:clientes(nombre, cuit, email), creador:usuarios!budgets_creado_por_fkey(nombre)`)
    .eq('id', id)
    .single()

  if (!budget) notFound()

  const { data: items } = await supabase
    .from('budget_items')
    .select('*')
    .eq('budget_id', id)
    .order('orden')

  const { data: versiones } = await supabase
    .from('budget_versions')
    .select('id, version_numero, cambios, created_at')
    .eq('budget_id', id)
    .order('version_numero', { ascending: false })

  const b = budget as typeof budget & {
    cliente?: { nombre: string; cuit?: string } | null
    creador?: { nombre: string } | null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/finanzas/presupuestos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Volver a presupuestos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Cabecera */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{b.numero} · v{b.version_actual}</p>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">{b.titulo}</h1>
                {b.cliente && <p className="text-sm text-slate-500 mt-1">{b.cliente.nombre}</p>}
              </div>
              <BudgetStatusBadge status={b.estado} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Emisión</p>
                <p className="font-medium text-slate-800">{formatDate(b.fecha_emision)}</p>
              </div>
              {b.fecha_validez && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Válido hasta</p>
                  <p className="font-medium text-slate-800">{formatDate(b.fecha_validez)}</p>
                </div>
              )}
              {b.condiciones && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">Condiciones</p>
                  <p className="text-slate-600">{b.condiciones}</p>
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
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Dto.</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(items as unknown as Array<{ id: string; descripcion: string; cantidad: number; precio_unitario: number; descuento_porcentaje: number; subtotal: number }> ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-700">{item.descripcion}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.cantidad}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatARS(item.precio_unitario)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">{item.descuento_porcentaje > 0 ? `${item.descuento_porcentaje}%` : '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{formatARS(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-sm text-slate-500">Subtotal</td>
                  <td className="px-4 py-2 text-right font-medium text-slate-700">{formatARS(b.subtotal)}</td>
                </tr>
                {b.iva_porcentaje > 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-sm text-slate-500">IVA ({b.iva_porcentaje}%)</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-700">{formatARS(b.iva_monto)}</td>
                  </tr>
                )}
                <tr className="bg-slate-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-800">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-lg text-slate-900">{formatARS(b.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Versiones */}
          {(versiones ?? []).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-3 text-sm">Historial de versiones</h2>
              <ul className="space-y-2">
                {(versiones as unknown as Array<{ id: string; version_numero: number; cambios: string | null; created_at: string }> ?? []).map(v => (
                  <li key={v.id} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                    <span className="font-medium text-slate-700">v{v.version_numero}</span>
                    <span className="text-slate-400 text-xs">{v.cambios ?? 'Sin descripción'}</span>
                    <span className="text-slate-400 text-xs">{formatDate(v.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {b.notas && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Notas</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{b.notas}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <BudgetActions budgetId={b.id} currentStatus={b.estado} invoiceId={b.invoice_id} />

          <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm space-y-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Info</h2>
            {b.creador && (
              <div>
                <p className="text-xs text-slate-400">Creado por</p>
                <p className="font-medium text-slate-700">{b.creador.nombre}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">Versión actual</p>
              <p className="font-medium text-slate-700">v{b.version_actual}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
