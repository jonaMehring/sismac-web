'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { changeTaskStatus, updateTask } from '@/app/actions/bpm'
import type { TaskStatus, TaskPriority } from '@/lib/types'
import { TASK_STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types'

interface Props {
  taskId: string
  currentStatus: TaskStatus
  currentPriority: TaskPriority
  usuarios: { id: string; nombre: string }[]
  currentAsignado: string | null
}

export function TaskDetailActions({ taskId, currentStatus, currentPriority, usuarios, currentAsignado }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const STATUSES: TaskStatus[] = ['pendiente', 'en_curso', 'en_revision', 'completada', 'demorada', 'cancelada']
  const PRIORITIES: TaskPriority[] = ['baja', 'normal', 'alta', 'critica']

  function handleStatus(status: TaskStatus) {
    setError(null)
    startTransition(async () => {
      try {
        await changeTaskStatus(taskId, status)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  function handleAsignar(asignado_a: string) {
    setError(null)
    startTransition(async () => {
      try {
        await updateTask(taskId, { asignado_a: asignado_a || null })
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  function handlePriority(prioridad: TaskPriority) {
    setError(null)
    startTransition(async () => {
      try {
        await updateTask(taskId, { prioridad })
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 space-y-4 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</h2>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Cambiar estado</label>
        <div className="grid grid-cols-2 gap-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              disabled={s === currentStatus}
              className={`text-xs px-2 py-1.5 rounded-md border transition-colors ${
                s === currentStatus
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold cursor-default'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {TASK_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Prioridad</label>
        <div className="grid grid-cols-2 gap-1">
          {PRIORITIES.map(p => (
            <button
              key={p}
              onClick={() => handlePriority(p)}
              disabled={p === currentPriority}
              className={`text-xs px-2 py-1.5 rounded-md border transition-colors ${
                p === currentPriority
                  ? 'bg-slate-100 border-slate-300 text-slate-800 font-semibold cursor-default'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {usuarios.length > 0 && (
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Asignar a</label>
          <select
            defaultValue={currentAsignado ?? ''}
            onChange={e => handleAsignar(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin asignar</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
