import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Receipt, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatARS } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import type { Expense } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

const ESTADO_STYLES: Record<string, string> = {
  registrado: 'bg-slate-100 text-slate-600',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
}

export default async function GastosPage() {
  const supabase = await createClient()

  const { data: gastos } = await supabase
    .from('expenses')
    .select(`
      *,
      categoria:expense_categories(nombre, color),
      proveedor:proveedores(nombre),
      cliente:clientes(nombre)
    `)
    .order('fecha', { ascending: false })
    .limit(50)

  return (
    <div>
      <PageHeader
        title="Gastos"
        description="Registro de gastos operativos"
        icon={Receipt}
        iconColor="bg-red-600"
        actions={
          <Link href="/finanzas/gastos/nuevo" className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Registrar gasto
          </Link>
        }
      />

      {(gastos ?? []).length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin gastos registrados"
          description="Registra el primer gasto operativo"
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Descripción</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Proveedor</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Monto</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(gastos as unknown as (Expense & { categoria?: { nombre: string; color: string }; proveedor?: { nombre: string }; cliente?: { nombre: string } })[]).map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 line-clamp-1">{g.descripcion}</p>
                    {g.cliente && <p className="text-xs text-slate-400">{g.cliente.nombre}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {g.categoria && (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ background: g.categoria.color }} />
                        {g.categoria.nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                    {g.proveedor?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {formatARS(g.monto)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell text-xs">
                    {formatDate(g.fecha)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', ESTADO_STYLES[g.estado] ?? 'bg-slate-100 text-slate-600')}>
                      {g.estado.charAt(0).toUpperCase() + g.estado.slice(1)}
                    </span>
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
