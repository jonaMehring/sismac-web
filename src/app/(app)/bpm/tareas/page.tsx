import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { CheckSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import { TaskStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils/dates'
import type { Task } from '@/lib/types'
import { KanbanView } from '@/components/bpm/KanbanView'

export default async function TareasPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const params = await searchParams
  const view = params.view ?? 'lista'
  const supabase = await createClient()

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      asignado:usuarios!tasks_asignado_a_fkey(id, nombre),
      cliente:clientes(id, nombre)
    `)
    .is('parent_task_id', null)
    .order('orden')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Tareas"
        description="Gestión de tareas y actividades"
        icon={CheckSquare}
        iconColor="bg-blue-600"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <Link href="?view=lista" className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'lista' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                Lista
              </Link>
              <Link href="?view=kanban" className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'kanban' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                Kanban
              </Link>
            </div>
            <Link href="/bpm/tareas/nueva" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Nueva tarea
            </Link>
          </div>
        }
      />

      {view === 'kanban' ? (
        <KanbanView initialTasks={(tasks ?? []) as unknown as Task[]} />
      ) : (
        <TaskListView tasks={(tasks ?? []) as unknown as Task[]} />
      )}
    </div>
  )
}

function TaskListView({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Sin tareas"
        description="Crea la primera tarea para comenzar"
        action={
          <Link href="/bpm/tareas/nueva" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Nueva tarea
          </Link>
        }
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Tarea</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Cliente</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Asignado a</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Prioridad</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Vencimiento</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map(task => {
            const t = task as Task & {
              asignado?: { nombre: string } | null
              cliente?: { nombre: string } | null
            }
            return (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/bpm/tareas/${t.id}`} className="font-medium text-slate-800 hover:text-blue-600 line-clamp-1">
                    {t.titulo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                  {t.cliente?.nombre ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                  {t.asignado?.nombre ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <TaskStatusBadge status={t.estado} />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <PriorityBadge priority={t.prioridad} />
                </td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                  {t.fecha_limite ? formatDate(t.fecha_limite) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
