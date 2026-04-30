import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ClipboardList, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatARS } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { BudgetStatusBadge } from '@/components/shared/StatusBadge'
import type { Budget } from '@/lib/types'

export default async function PresupuestosPage() {
  const supabase = await createClient()

  const { data: presupuestos } = await supabase
    .from('budgets')
    .select(`*, cliente:clientes(nombre)`)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        description="Creación y seguimiento de presupuestos"
        icon={ClipboardList}
        iconColor="bg-purple-600"
        actions={
          <Link href="/finanzas/presupuestos/nuevo" className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Nuevo presupuesto
          </Link>
        }
      />

      {(presupuestos ?? []).length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin presupuestos" description="Crea el primer presupuesto" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Presupuesto</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Validez</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Versión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(presupuestos as unknown as (Budget & { cliente?: { nombre: string } })[]).map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/finanzas/presupuestos/${b.id}`} className="font-medium text-purple-600 hover:underline">
                      {b.numero}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-1">{b.titulo}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{b.cliente?.nombre}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatARS(b.total)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{formatDate(b.fecha_emision)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
                    {b.fecha_validez ? formatDate(b.fecha_validez) : '—'}
                  </td>
                  <td className="px-4 py-3"><BudgetStatusBadge status={b.estado} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">v{b.version_actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
