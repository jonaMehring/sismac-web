'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTask } from '@/app/actions/bpm'

interface Props {
  clientes: { id: string; nombre: string }[]
  usuarios: { id: string; nombre: string }[]
  processes: { id: string; nombre: string }[]
}

export function NewTaskForm({ clientes, usuarios, processes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      titulo: fd.get('titulo') as string,
      descripcion: fd.get('descripcion') as string || undefined,
      prioridad: fd.get('prioridad') as string,
      estado: 'pendiente',
      cliente_id: fd.get('cliente_id') as string || undefined,
      asignado_a: fd.get('asignado_a') as string || undefined,
      process_id: fd.get('process_id') as string || undefined,
      fecha_limite: fd.get('fecha_limite') as string || undefined,
      estimacion_horas: fd.get('estimacion_horas') ? Number(fd.get('estimacion_horas')) : undefined,
    }
    startTransition(async () => {
      try {
        const task = await createTask(data)
        router.push(`/bpm/tareas/${task.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear la tarea')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
        <input
          name="titulo"
          required
          autoFocus
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          placeholder="Descripción corta de la tarea"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
        <textarea
          name="descripcion"
          rows={4}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          placeholder="Detalla los requerimientos, contexto, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridad *</label>
          <select
            name="prioridad"
            required
            defaultValue="normal"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha límite</label>
          <input
            type="date"
            name="fecha_limite"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
          <select
            name="cliente_id"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Asignar a</label>
          <select
            name="asignado_a"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin asignar</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {processes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Proceso</label>
            <select
              name="process_id"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Sin proceso</option>
              {processes.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimación (horas)</label>
          <input
            type="number"
            name="estimacion_horas"
            min="0"
            step="0.5"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
        >
          {isPending ? 'Creando...' : 'Crear tarea'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
