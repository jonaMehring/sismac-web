'use client'

import { useState, useTransition } from 'react'
import { createConsumanEntry } from '@/app/actions/compliance'
import type { Sector, Equipo } from '@/lib/types'

interface Props {
  clienteId: string
  sectores: (Sector & { equipos: Equipo[] })[]
  onSuccess?: () => void
  onCancel?: () => void
}

const TIPOS = [
  { value: 'mantenimiento_preventivo', label: 'Mantenimiento preventivo' },
  { value: 'mantenimiento_correctivo', label: 'Mantenimiento correctivo' },
  { value: 'inspeccion', label: 'Inspección' },
  { value: 'certificacion', label: 'Certificación' },
  { value: 'reemplazo', label: 'Reemplazo de componente' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'incidente', label: 'Incidente' },
  { value: 'otro', label: 'Otro' },
]

export function NewServicioForm({ clienteId, sectores, onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [sectorId, setSectorId] = useState('')

  const equiposDelSector = sectores.find(s => s.id === sectorId)?.equipos ?? []

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all'
  const lbl = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const costoStr = fd.get('costo') as string
    startTransition(async () => {
      try {
        await createConsumanEntry({
          cliente_id: clienteId,
          tipo: fd.get('tipo') as string,
          titulo: fd.get('titulo') as string,
          descripcion: (fd.get('descripcion') as string) || null,
          fecha: fd.get('fecha') as string,
          sector_id: (fd.get('sector_id') as string) || null,
          equipo_id: (fd.get('equipo_id') as string) || null,
          proxima_revision: (fd.get('proxima_revision') as string) || null,
          costo: costoStr ? parseFloat(costoStr) : null,
          observaciones: (fd.get('observaciones') as string) || null,
        })
        ;(e.target as HTMLFormElement).reset()
        setSectorId('')
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al registrar servicio')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
      <h4 className="text-sm font-bold text-slate-700">Registrar nuevo servicio</h4>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Tipo *</label>
          <select name="tipo" required defaultValue="" className={inp}>
            <option value="" disabled>Seleccionar tipo</option>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Fecha *</label>
          <input type="date" name="fecha" required defaultValue={new Date().toISOString().split('T')[0]} className={inp} />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Título *</label>
          <input name="titulo" required className={inp} placeholder="Ej: Mantenimiento preventivo compresor GA75" />
        </div>
        <div>
          <label className={lbl}>Sector</label>
          <select name="sector_id" value={sectorId} onChange={e => setSectorId(e.target.value)} className={inp}>
            <option value="">Sin sector</option>
            {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Equipo</label>
          <select name="equipo_id" className={inp} disabled={!sectorId}>
            <option value="">Sin equipo</option>
            {equiposDelSector.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Descripción</label>
          <textarea name="descripcion" rows={2} className={`${inp} resize-none`} placeholder="Detalle del trabajo realizado" />
        </div>
        <div>
          <label className={lbl}>Próxima revisión</label>
          <input type="date" name="proxima_revision" className={inp} />
        </div>
        <div>
          <label className={lbl}>Costo (ARS)</label>
          <input type="number" name="costo" step="0.01" min="0" className={inp} placeholder="0.00" />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Observaciones</label>
          <input name="observaciones" className={inp} placeholder="Notas adicionales" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="px-5 py-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
          {isPending ? 'Registrando...' : 'Registrar servicio'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-xl transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
