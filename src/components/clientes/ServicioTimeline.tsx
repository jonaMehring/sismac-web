'use client'

import { useState } from 'react'
import { Plus, Wrench, Search, ClipboardCheck, Award, RefreshCw, GraduationCap, AlertTriangle, MoreHorizontal } from 'lucide-react'
import { NewServicioForm } from './NewServicioForm'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { ConsumanEntry, Sector, Equipo } from '@/lib/types'

interface Props {
  entries: ConsumanEntry[]
  clienteId: string
  sectores: (Sector & { equipos: Equipo[] })[]
}

const TIPO_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  mantenimiento_preventivo: { label: 'Mant. Preventivo', icon: Wrench,         cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  mantenimiento_correctivo: { label: 'Mant. Correctivo', icon: Wrench,         cls: 'bg-orange-50 text-orange-600 border-orange-100' },
  inspeccion:               { label: 'Inspección',       icon: Search,         cls: 'bg-purple-50 text-purple-600 border-purple-100' },
  certificacion:            { label: 'Certificación',    icon: Award,          cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  reemplazo:                { label: 'Reemplazo',        icon: RefreshCw,      cls: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  capacitacion:             { label: 'Capacitación',     icon: GraduationCap,  cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  incidente:                { label: 'Incidente',        icon: AlertTriangle,  cls: 'bg-red-50 text-red-600 border-red-100' },
  otro:                     { label: 'Otro',             icon: MoreHorizontal, cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

function EntryCard({ entry }: { entry: ConsumanEntry }) {
  const cfg = TIPO_CONFIG[entry.tipo] ?? TIPO_CONFIG.otro
  const Icon = cfg.icon

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cfg.cls}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-px flex-1 bg-slate-100 mt-2" />
      </div>
      <div className="flex-1 pb-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${cfg.cls}`}>{cfg.label}</span>
                {entry.equipo && (
                  <span className="text-xs text-slate-400">{entry.equipo.nombre}</span>
                )}
              </div>
              <h4 className="font-semibold text-slate-800 text-sm mt-1">{entry.titulo}</h4>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-slate-500">
                {new Date(entry.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              {entry.costo != null && (
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  ${entry.costo.toLocaleString('es-AR')}
                </p>
              )}
            </div>
          </div>
          {entry.descripcion && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{entry.descripcion}</p>
          )}
          {entry.proxima_revision && (
            <p className="text-xs text-amber-600 mt-2 font-medium">
              Próxima revisión: {new Date(entry.proxima_revision).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function ServicioTimeline({ entries, clienteId, sectores }: Props) {
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const [, startTransition] = useTransition()

  function refresh() {
    startTransition(() => router.refresh())
  }

  const sorted = [...entries].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{entries.length} intervenci{entries.length !== 1 ? 'ones' : 'ón'} registrada{entries.length !== 1 ? 's' : ''}</p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900 font-semibold border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Registrar servicio
          </button>
        )}
      </div>

      {showForm && (
        <NewServicioForm
          clienteId={clienteId}
          sectores={sectores}
          onSuccess={() => { setShowForm(false); refresh() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {sorted.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Wrench className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Sin servicios registrados</p>
          <p className="text-xs text-slate-400 mt-1">Registrá el primer servicio o mantenimiento realizado</p>
        </div>
      ) : (
        <div className="pt-2">
          {sorted.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          {sorted.length > 0 && <div className="h-1" />}
        </div>
      )}
    </div>
  )
}
