import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TaskStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils/dates'
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react'
import Link from 'next/link'
import { TaskDetailActions } from '@/components/bpm/TaskDetailActions'
import { CommentForm } from '@/components/bpm/CommentForm'
import type { Task, TaskComment } from '@/lib/types'

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      *,
      asignado:usuarios!tasks_asignado_a_fkey(id, nombre),
      creador:usuarios!tasks_creado_por_fkey(id, nombre),
      cliente:clientes(id, nombre),
      subtasks:tasks!tasks_parent_task_id_fkey(id, titulo, estado, prioridad)
    `)
    .eq('id', id)
    .single()

  if (!task) notFound()

  const { data: comments } = await supabase
    .from('task_comments')
    .select(`*, autor:usuarios!task_comments_autor_id_fkey(id, nombre)`)
    .eq('task_id', id)
    .order('created_at')

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  const t = task as unknown as Task & {
    asignado?: { id: string; nombre: string } | null
    creador?: { id: string; nombre: string } | null
    cliente?: { id: string; nombre: string } | null
    subtasks?: { id: string; titulo: string; estado: string; prioridad: string }[]
  }

  const taskComments = (comments ?? []) as unknown as (TaskComment & {
    autor?: { id: string; nombre: string } | null
  })[]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <div className="mb-4">
        <Link href="/bpm/tareas" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Volver a tareas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{t.titulo}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={t.prioridad} />
                <TaskStatusBadge status={t.estado} />
              </div>
            </div>
            {t.descripcion && (
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{t.descripcion}</p>
            )}
          </div>

          {/* Subtareas */}
          {(t.subtasks ?? []).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-3 text-sm">Subtareas ({t.subtasks!.length})</h2>
              <ul className="space-y-2">
                {t.subtasks!.map(sub => (
                  <li key={sub.id} className="flex items-center gap-2">
                    <Link href={`/bpm/tareas/${sub.id}`} className="text-sm text-blue-600 hover:underline flex-1 truncate">
                      {sub.titulo}
                    </Link>
                    <TaskStatusBadge status={sub.estado as Task['estado']} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comentarios */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Actividad</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {taskComments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sin actividad aún</p>
              ) : (
                taskComments.map(c => (
                  <div key={c.id} className={`px-5 py-4 ${c.tipo !== 'comentario' ? 'bg-slate-50/50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">
                          {c.autor?.nombre?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-800">{c.autor?.nombre ?? 'Sistema'}</span>
                          <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                          {c.tipo !== 'comentario' && (
                            <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                              {c.tipo === 'cambio_estado' ? 'estado' : c.tipo}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{c.contenido}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-4 border-t border-slate-100">
              <CommentForm taskId={t.id} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide text-slate-500">Detalles</h2>
            <dl className="space-y-3">
              {t.cliente && (
                <div>
                  <dt className="text-xs text-slate-400 mb-0.5">Cliente</dt>
                  <dd className="text-sm font-medium text-slate-800">{t.cliente.nombre}</dd>
                </div>
              )}
              {t.asignado && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-400 mb-0.5">Asignado a</dt>
                    <dd className="text-sm font-medium text-slate-800">{t.asignado.nombre}</dd>
                  </div>
                </div>
              )}
              {t.fecha_limite && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-400 mb-0.5">Fecha límite</dt>
                    <dd className="text-sm font-medium text-slate-800">{formatDate(t.fecha_limite)}</dd>
                  </div>
                </div>
              )}
              {(t.estimacion_horas || t.horas_reales) && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-400 mb-0.5">Horas</dt>
                    <dd className="text-sm font-medium text-slate-800">
                      {t.horas_reales ?? 0}h reales {t.estimacion_horas ? `/ ${t.estimacion_horas}h estimadas` : ''}
                    </dd>
                  </div>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Creada</dt>
                <dd className="text-sm text-slate-600">{formatDate(t.created_at)}</dd>
              </div>
              {t.completada_en && (
                <div>
                  <dt className="text-xs text-slate-400 mb-0.5">Completada</dt>
                  <dd className="text-sm text-slate-600">{formatDate(t.completada_en)}</dd>
                </div>
              )}
            </dl>
          </div>

          <TaskDetailActions
            taskId={t.id}
            currentStatus={t.estado}
            currentPriority={t.prioridad}
            usuarios={usuarios ?? []}
            currentAsignado={t.asignado_a ?? null}
          />
        </div>
      </div>
    </div>
  )
}
