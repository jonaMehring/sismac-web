'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronRight, Building2, Cpu, Plus, Calendar, Wrench } from 'lucide-react'
import { NewSectorForm } from './NewSectorForm'
import { NewEquipoForm } from './NewEquipoForm'
import { useRouter } from 'next/navigation'
import type { Sector, Equipo, EquipoStatus } from '@/lib/types'

interface SectorWithEquipos extends Sector {
  equipos: Equipo[]
}

interface Props {
  sectores: SectorWithEquipos[]
  clienteId: string
}

const ESTADO_BADGE: Record<EquipoStatus, { label: string; cls: string }> = {
  operativo:      { label: 'Operativo',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  mantenimiento:  { label: 'Mantenimiento',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  fuera_servicio: { label: 'Fuera de servicio',cls: 'bg-red-50 text-red-700 border-red-200' },
  baja:           { label: 'Baja',             cls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

function EquipoRow({ equipo }: { equipo: Equipo }) {
  const badge = ESTADO_BADGE[equipo.estado] ?? ESTADO_BADGE.operativo
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
        <Cpu className="w-3.5 h-3.5 text-cyan-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{equipo.nombre}</p>
        {(equipo.marca || equipo.modelo) && (
          <p className="text-xs text-slate-400 truncate">{[equipo.marca, equipo.modelo].filter(Boolean).join(' · ')}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {equipo.proxima_revision && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            {new Date(equipo.proxima_revision).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}
          </span>
        )}
        <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    </div>
  )
}

function SectorCard({ sector, clienteId }: { sector: SectorWithEquipos; clienteId: string }) {
  const [open, setOpen] = useState(true)
  const [showEquipoForm, setShowEquipoForm] = useState(false)
  const router = useRouter()
  const [, startTransition] = useTransition()

  const operativos = sector.equipos.filter(e => e.estado === 'operativo').length

  function refresh() {
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{sector.nombre}</p>
          <p className="text-xs text-slate-400">
            {sector.equipos.length} equipo{sector.equipos.length !== 1 ? 's' : ''}
            {sector.equipos.length > 0 && ` · ${operativos} operativo${operativos !== 1 ? 's' : ''}`}
            {sector.ubicacion && ` · ${sector.ubicacion}`}
          </p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 pb-3 pt-2 space-y-1">
          {sector.equipos.length === 0 && !showEquipoForm && (
            <p className="text-xs text-slate-400 py-2 pl-1">Sin equipos en este sector</p>
          )}
          {sector.equipos.map(eq => <EquipoRow key={eq.id} equipo={eq} />)}

          {showEquipoForm ? (
            <div className="mt-2">
              <NewEquipoForm
                sectorId={sector.id}
                onSuccess={() => { setShowEquipoForm(false); refresh() }}
                onCancel={() => setShowEquipoForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowEquipoForm(true)}
              className="flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 font-semibold mt-2 ml-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar equipo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function SectoresEquipos({ sectores: initial, clienteId }: Props) {
  const [showSectorForm, setShowSectorForm] = useState(false)
  const router = useRouter()
  const [, startTransition] = useTransition()

  function refresh() {
    startTransition(() => router.refresh())
  }

  const totalEquipos = initial.reduce((acc, s) => acc + s.equipos.length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Building2 className="w-4 h-4" />
            <span>{initial.length} sector{initial.length !== 1 ? 'es' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Wrench className="w-4 h-4" />
            <span>{totalEquipos} equipo{totalEquipos !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {!showSectorForm && (
          <button
            onClick={() => setShowSectorForm(true)}
            className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900 font-semibold border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo sector
          </button>
        )}
      </div>

      {showSectorForm && (
        <NewSectorForm
          clienteId={clienteId}
          onSuccess={() => { setShowSectorForm(false); refresh() }}
          onCancel={() => setShowSectorForm(false)}
        />
      )}

      {initial.length === 0 && !showSectorForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Sin sectores registrados</p>
          <p className="text-xs text-slate-400 mt-1">Agregá el primer sector para organizar los equipos</p>
        </div>
      )}

      {initial.map(sector => (
        <SectorCard key={sector.id} sector={sector} clienteId={clienteId} />
      ))}
    </div>
  )
}
