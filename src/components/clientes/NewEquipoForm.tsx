'use client'

import { useState, useTransition } from 'react'
import { createEquipo } from '@/app/actions/clients'

interface Props {
  sectorId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const ESTADOS = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
  { value: 'fuera_servicio', label: 'Fuera de servicio' },
  { value: 'baja', label: 'Dado de baja' },
]

export function NewEquipoForm({ sectorId, onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all'
  const lbl = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createEquipo({
          sector_id: sectorId,
          nombre: fd.get('nombre') as string,
          modelo: (fd.get('modelo') as string) || undefined,
          marca: (fd.get('marca') as string) || undefined,
          numero_serie: (fd.get('numero_serie') as string) || undefined,
          estado: (fd.get('estado') as string) || 'operativo',
          proxima_revision: (fd.get('proxima_revision') as string) || undefined,
          notas: (fd.get('notas') as string) || undefined,
        })
        ;(e.target as HTMLFormElement).reset()
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear equipo')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 ml-4">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-3">
          <label className={lbl}>Nombre del equipo *</label>
          <input name="nombre" required className={inp} placeholder="Ej: Compresor de tornillo 75HP" />
        </div>
        <div>
          <label className={lbl}>Marca</label>
          <input name="marca" className={inp} placeholder="Ej: Atlas Copco" />
        </div>
        <div>
          <label className={lbl}>Modelo</label>
          <input name="modelo" className={inp} placeholder="Ej: GA75" />
        </div>
        <div>
          <label className={lbl}>N° de serie</label>
          <input name="numero_serie" className={inp} placeholder="S/N" />
        </div>
        <div>
          <label className={lbl}>Estado</label>
          <select name="estado" defaultValue="operativo" className={inp}>
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Próxima revisión</label>
          <input type="date" name="proxima_revision" className={inp} />
        </div>
        <div>
          <label className={lbl}>Notas</label>
          <input name="notas" className={inp} placeholder="Observaciones" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
          {isPending ? 'Guardando...' : 'Agregar equipo'}
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
