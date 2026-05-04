import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { PriorityBadge } from '@/components/shared/StatusBadge'
import { GitBranch, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import type { Process } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  activo: 'Activo', pausado: 'Pausado', completado: 'Completado', cancelado: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  activo: 'bg-green-100 text-green-700',
  pausado: 'bg-yellow-100 text-yellow-700',
  completado: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-gray-100 text-gray-500',
}

export default async function ProcesosPage() {
  const supabase = await createClient()

  const { data: processes } = await supabase
    .from('processes')
    .select(`
      *,
      cliente:clientes(id, nombre),
      template:process_templates(nombre)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <PageHeader
        title="Procesos"
        description="Gestión de procesos activos"
        icon={GitBranch}
        iconColor="bg-blue-600"
        actions={
          <Link href="/bpm/procesos/nuevo" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo proceso
          </Link>
        }
      />

      {(processes ?? []).length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="Sin procesos"
          description="Crea el primer proceso para comenzar a gestionar operaciones"
          action={
            <Link href="/bpm/procesos/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Nuevo proceso
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Proceso</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Plantilla</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Prioridad</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Fecha límite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(processes as unknown as (Process & { cliente?: { nombre: string }; template?: { nombre: string } })[]).map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 line-clamp-1">{p.nombre}</p>
                    {p.descripcion && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                    {p.cliente?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                    {p.template?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLOR[p.estado] ?? 'bg-slate-100 text-slate-600')}>
                      {STATUS_LABEL[p.estado] ?? p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <PriorityBadge priority={p.prioridad} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                    {p.fecha_limite ? formatDate(p.fecha_limite) : '—'}
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
