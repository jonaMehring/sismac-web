'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Cog, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { VencimientoBadge } from '@/components/shared/StatusBadge'
import { EquipoEstadoBadge, CriticidadBadge } from '@/components/inspecciones/Badges'
import type { InspEquipo } from '@/lib/inspecciones/types'

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'operativo', label: 'Operativos' },
  { key: 'mantenimiento', label: 'En mantenimiento' },
  { key: 'fuera_servicio', label: 'Fuera de servicio' },
  { key: 'vencidos', label: 'Insp. vencida' },
]

export function EquiposBuscador({ equipos }: { equipos: InspEquipo[] }) {
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase()
    return equipos.filter(e => {
      if (filtro === 'vencidos') {
        if (!(e.proxima_inspeccion && diasParaVencer(e.proxima_inspeccion) < 0)) return false
      } else if (filtro !== 'todos' && e.estado !== filtro) {
        return false
      }
      if (!term) return true
      return [e.codigo, e.nombre, e.numero_serie, e.patente, e.cliente?.nombre, e.tipo, e.ubicacion]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(term))
    })
  }, [equipos, q, filtro])

  return (
    <div id="equipos" className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="px-5 py-4 border-b border-slate-50 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Cog className="w-4 h-4 text-slate-400" /> Equipos
            <span className="text-xs font-normal text-slate-400">({filtrados.length}/{equipos.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por TAG, serie, patente, cliente..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:bg-white focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTROS.map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={cn('px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                filtro === f.key ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-500 border-slate-200 hover:bg-slate-50')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">TAG / Equipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente / Ubicación</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Próx. inspección</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtrados.map(e => (
              <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/inspecciones/equipos/${e.id}`} className="group flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#2563EB] text-white flex items-center justify-center shrink-0">
                      <Cog className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-xs text-blue-600 font-semibold">{e.codigo}</span>
                      <span className="block font-medium text-slate-800 group-hover:text-blue-700 truncate">{e.nombre}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <p className="text-slate-700 text-xs font-medium truncate max-w-[220px]">{e.cliente?.nombre}</p>
                  <p className="text-slate-400 text-xs truncate max-w-[220px]">{e.ubicacion}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <EquipoEstadoBadge estado={e.estado} />
                    <CriticidadBadge criticidad={e.criticidad} />
                  </div>
                </td>
                <td className="px-5 py-3">
                  {e.proxima_inspeccion ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs text-slate-500">{formatDate(e.proxima_inspeccion)}</span>
                      <VencimientoBadge dias={diasParaVencer(e.proxima_inspeccion)} />
                    </div>
                  ) : <span className="text-xs text-slate-400">—</span>}
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">Sin equipos que coincidan con la búsqueda</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
