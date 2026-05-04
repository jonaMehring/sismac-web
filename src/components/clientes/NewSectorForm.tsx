'use client'

import { useState, useTransition } from 'react'
import { createSector } from '@/app/actions/clients'

interface Props {
  clienteId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function NewSectorForm({ clienteId, onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all'
  const lbl = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createSector({
          cliente_id: clienteId,
          nombre: fd.get('nombre') as string,
          descripcion: (fd.get('descripcion') as string) || undefined,
          ubicacion: (fd.get('ubicacion') as string) || undefined,
        })
        ;(e.target as HTMLFormElement).reset()
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear sector')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={lbl}>Nombre del sector *</label>
          <input name="nombre" required className={inp} placeholder="Ej: Planta Norte, Sala de calderas" />
        </div>
        <div>
          <label className={lbl}>Ubicación</label>
          <input name="ubicacion" className={inp} placeholder="Ej: Edificio A, Piso 2" />
        </div>
        <div>
          <label className={lbl}>Descripción</label>
          <input name="descripcion" className={inp} placeholder="Breve descripción" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
          {isPending ? 'Guardando...' : 'Agregar sector'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
