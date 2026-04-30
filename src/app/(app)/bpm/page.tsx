import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { CheckSquare, Clock, Users, AlertTriangle, Plus } from 'lucide-react'
import Link from 'next/link'
import { TaskStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils/dates'
import type { Task } from '@/lib/types'

export default async function BpmPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: tareasActivas },
    { data: tareasDemoradas },
    { data: misTareas },
    { data: procesos },
  ] = await Promise.all([
    supabase.from('tasks').select('id').in('estado', ['pendiente', 'en_curso']),
    supabase.from('tasks').select('id, titulo, asignado_a, fecha_limite, prioridad, estado, cliente:clientes(nombre), asignado:usuarios!tasks_asignado_a_fkey(nombre)')
      .eq('estado', 'demorada').order('fecha_limite').limit(10),
    supabase.from('tasks').select('id, titulo, estado, prioridad, fecha_limite, cliente:clientes(nombre)')
      .eq('asignado_a', user.id)
      .in('estado', ['pendiente', 'en_curso', 'demorada'])
      .order('fecha_limite').limit(10),
    supabase.from('processes').select('id').eq('estado', 'activo'),
  ])

  return (
    <div>
      <PageHeader
        title="Operaciones"
        description="Panel de gestión de tareas y procesos"
        icon={CheckSquare}
        iconColor="bg-blue-600"
        actions={
          <Link href="/bpm/tareas/nueva" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Nueva tarea
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Tareas activas" value={tareasActivas?.length ?? 0} icon={CheckSquare} iconColor="bg-blue-100 text-blue-600" />
        <StatCard title="Demoradas" value={tareasDemoradas?.length ?? 0} icon={AlertTriangle} iconColor="bg-red-100 text-red-600" alert={(tareasDemoradas?.length ?? 0) > 0} />
        <StatCard title="Mis tareas hoy" value={misTareas?.length ?? 0} icon={Users} iconColor="bg-purple-100 text-purple-600" />
        <StatCard title="Procesos activos" value={procesos?.length ?? 0} icon={Clock} iconColor="bg-orange-100 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis tareas */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Mis tareas pendientes</h2>
            <Link href="/bpm/tareas?view=kanban" className="text-xs text-blue-600 hover:underline">Ver Kanban</Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {(misTareas ?? []).length === 0 ? (
              <li className="text-sm text-slate-400 text-center py-8">Sin tareas asignadas</li>
            ) : (
              (misTareas as unknown as (Task & { cliente?: { nombre: string } })[]).map(t => (
                <li key={t.id}>
                  <Link href={`/bpm/tareas/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.titulo}</p>
                      <p className="text-xs text-slate-400">{t.cliente?.nombre ?? 'Sin cliente'}{t.fecha_limite && ` · ${formatDate(t.fecha_limite)}`}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <PriorityBadge priority={t.prioridad} />
                      <TaskStatusBadge status={t.estado} />
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Tareas demoradas */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Tareas demoradas
            </h2>
            <Link href="/bpm/tareas?estado=demorada" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {(tareasDemoradas ?? []).length === 0 ? (
              <li className="text-sm text-slate-400 text-center py-8">Sin tareas demoradas</li>
            ) : (
              (tareasDemoradas as unknown as (Task & { cliente?: { nombre: string }; asignado?: { nombre: string } })[]).map(t => (
                <li key={t.id}>
                  <Link href={`/bpm/tareas/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.titulo}</p>
                      <p className="text-xs text-red-500">{t.fecha_limite && `Venció: ${formatDate(t.fecha_limite)}`}</p>
                      {t.asignado && <p className="text-xs text-slate-400">{t.asignado.nombre}</p>}
                    </div>
                    <PriorityBadge priority={t.prioridad} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
