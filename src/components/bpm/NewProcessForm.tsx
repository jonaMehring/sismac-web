'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProcess } from '@/app/actions/bpm'

interface Props {
  clientes: { id: string; nombre: string }[]
  templates: { id: string; nombre: string }[]
}

export function NewProcessForm({ clientes, templates }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const today = new Date().toISOString().split('T')[0]
    const data = {
      nombre: fd.get('nombre') as string,
      descripcion: (fd.get('descripcion') as string) || undefined,
      prioridad: fd.get('prioridad') as string,
      template_id: (fd.get('template_id') as string) || undefined,
      cliente_id: (fd.get('cliente_id') as string) || undefined,
      fecha_inicio: today,
      fecha_limite: (fd.get('fecha_limite') as string) || undefined,
    }
    startTransition(async () => {
      try {
        await createProcess(data)
        router.push('/bpm/procesos')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear el proceso')
      }
    })
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del proceso *</label>
        <input name="nombre" required autoFocus className={inputClass} placeholder="Ej: Mantenimiento preventivo trimestral" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
        <textarea name="descripcion" rows={3} className={`${inputClass} resize-none`} placeholder="Objetivos, alcance, notas..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridad *</label>
          <select name="prioridad" required defaultValue="normal" className={inputClass}>
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha límite</label>
          <input type="date" name="fecha_limite" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
          <select name="cliente_id" className={inputClass}>
            <option value="">Sin cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Plantilla base</label>
          <select name="template_id" className={inputClass}>
            <option value="">Sin plantilla</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors">
          {isPending ? 'Creando...' : 'Crear proceso'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
