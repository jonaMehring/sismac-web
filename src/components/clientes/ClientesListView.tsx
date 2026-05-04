'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, Search, CheckCircle2, AlertTriangle, XCircle, Circle } from 'lucide-react'
import type { Cliente } from '@/lib/types'

export interface ClienteWithStats extends Cliente {
  sectoresCount: number
  equiposCount: number
  tareasCount: number
  compliance: 'ok' | 'warning' | 'danger' | 'none'
}

const COMPLIANCE_BADGE = {
  ok:      { label: 'Al día',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  warning: { label: 'Por vencer',  cls: 'bg-amber-50 text-amber-700 border-amber-200',       Icon: AlertTriangle },
  danger:  { label: 'Docs vencidos', cls: 'bg-red-50 text-red-700 border-red-200',           Icon: XCircle },
  none:    { label: 'Sin docs',    cls: 'bg-slate-100 text-slate-500 border-slate-200',       Icon: Circle },
}

interface Props {
  clientes: ClienteWithStats[]
}

export function ClientesListView({ clientes }: Props) {
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'activos' | 'inactivos'>('activos')

  const visible = clientes.filter(c => {
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.cuit ?? '').includes(search) ||
      (c.razon_social ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFiltro = filtro === 'todos' || (filtro === 'activos' ? c.activo : !c.activo)
    return matchSearch && matchFiltro
  })

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, CUIT o razón social..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl self-start">
          {(['activos', 'todos', 'inactivos'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filtro === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Sin resultados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(c => {
            const cb = COMPLIANCE_BADGE[c.compliance]
            const Icon = cb.Icon
            return (
              <Link key={c.id} href={`/clientes/${c.id}`}
                className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-cyan-300 hover:shadow-md transition-all group"
                style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-base shrink-0 group-hover:from-cyan-700 group-hover:to-cyan-900 transition-all">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate text-sm">{c.nombre}</h3>
                    {c.razon_social && <p className="text-xs text-slate-400 truncate">{c.razon_social}</p>}
                    {c.cuit && <p className="text-xs text-slate-400">CUIT: {c.cuit}</p>}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  {c.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                      <Mail className="w-3 h-3 shrink-0" /> {c.email}
                    </div>
                  )}
                  {c.telefono && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3 h-3 shrink-0" /> {c.telefono}
                    </div>
                  )}
                  {(c.localidad || c.provincia) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {[c.localidad, c.provincia].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {c.sectoresCount > 0 && <span>{c.sectoresCount} sector{c.sectoresCount !== 1 ? 'es' : ''}</span>}
                    {c.equiposCount > 0 && <span>{c.equiposCount} equipo{c.equiposCount !== 1 ? 's' : ''}</span>}
                    {c.tareasCount > 0 && (
                      <span className="text-amber-600 font-medium">{c.tareasCount} tarea{c.tareasCount !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold border rounded-full px-2 py-0.5 ${cb.cls}`}>
                    <Icon className="w-3 h-3" /> {cb.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
