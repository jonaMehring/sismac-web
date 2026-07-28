import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Cog, Plus, LayoutGrid, FileCheck2, Wrench, ShieldCheck,
  CalendarClock, Clock, MapPin, Gauge,
} from 'lucide-react'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { formatARS } from '@/lib/utils/currency'
import { VencimientoBadge } from '@/components/shared/StatusBadge'
import {
  EquipoEstadoBadge, CriticidadBadge, TipoInspeccionBadge, ResultadoBadge, CertEstadoBadge,
} from '@/components/inspecciones/Badges'
import type { InspEquipo, Inspeccion, Mantenimiento, Certificacion } from '@/lib/inspecciones/types'

const TABS = [
  { key: 'ficha', label: 'Ficha técnica', Icon: LayoutGrid },
  { key: 'inspecciones', label: 'Inspecciones', Icon: FileCheck2 },
  { key: 'mantenimientos', label: 'Mantenimientos', Icon: Wrench },
  { key: 'certificaciones', label: 'Certificaciones', Icon: ShieldCheck },
]

export default async function EquipoDetailPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab = 'ficha' } = await searchParams
  const supabase = await createClient()

  const { data: equipo } = await supabase.from('insp_equipos').select('*').eq('id', id).single()
  if (!equipo) notFound()
  const eq = equipo as unknown as InspEquipo

  const [{ data: inspecciones }, { data: mantenimientos }, { data: certificaciones }] = await Promise.all([
    supabase.from('inspecciones').select('*').eq('equipo_id', id).order('fecha', { ascending: false }),
    supabase.from('insp_mantenimientos').select('*').eq('equipo_id', id).order('fecha', { ascending: false }),
    supabase.from('insp_certificaciones').select('*').eq('equipo_id', id).order('fecha_vencimiento'),
  ])
  const insps = (inspecciones ?? []) as unknown as Inspeccion[]
  const mants = (mantenimientos ?? []) as unknown as Mantenimiento[]
  const certs = (certificaciones ?? []) as unknown as Certificacion[]

  const costoTotal = mants.reduce((s, m) => s + Number(m.costo ?? 0), 0)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/inspecciones" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver a inspecciones
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start gap-4 flex-wrap">
          {eq.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={eq.foto} alt={eq.nombre} className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#2563EB] flex items-center justify-center text-white shrink-0">
              <Cog className="w-7 h-7" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-blue-600 font-semibold">{eq.codigo}</span>
              <EquipoEstadoBadge estado={eq.estado} />
              <CriticidadBadge criticidad={eq.criticidad} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{eq.nombre}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{eq.tipo} · {[eq.marca, eq.modelo].filter(Boolean).join(' ')}</p>
            {eq.ubicacion && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {eq.cliente?.nombre} — {eq.ubicacion}</p>}
          </div>
          <Link href={`/inspecciones/nueva?equipo=${id}`}
            className="btn-brand flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl shrink-0">
            <Plus className="w-4 h-4" /> Inspeccionar
          </Link>
        </div>

        {/* KPI chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-slate-400 shrink-0" />
            <div><p className="text-xs text-slate-500">Última insp.</p><p className="text-sm font-bold text-slate-800">{eq.ultima_inspeccion ? formatDate(eq.ultima_inspeccion) : '—'}</p></div>
          </div>
          <div className={`rounded-xl border px-3 py-2.5 flex items-center gap-2.5 ${eq.proxima_inspeccion && diasParaVencer(eq.proxima_inspeccion) < 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
            <CalendarClock className={`w-5 h-5 shrink-0 ${eq.proxima_inspeccion && diasParaVencer(eq.proxima_inspeccion) < 0 ? 'text-red-500' : 'text-slate-400'}`} />
            <div><p className="text-xs text-slate-500">Próx. insp.</p><p className="text-sm font-bold text-slate-800">{eq.proxima_inspeccion ? formatDate(eq.proxima_inspeccion) : '—'}</p></div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
            <div><p className="text-xs text-slate-500">Horas de uso</p><p className="text-sm font-bold text-slate-800">{eq.horas_uso != null ? eq.horas_uso.toLocaleString('es-AR') : '—'}</p></div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex items-center gap-2.5">
            <Gauge className="w-5 h-5 text-slate-400 shrink-0" />
            <div><p className="text-xs text-slate-500">Potencia</p><p className="text-sm font-bold text-slate-800">{eq.potencia ?? '—'}</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-white rounded-2xl border border-slate-100 p-1 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        {TABS.map(({ key, label, Icon }) => (
          <Link key={key} href={`/inspecciones/equipos/${id}?tab=${key}`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === key ? 'bg-gradient-to-r from-[#0A2540] to-[#2563EB] text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </Link>
        ))}
      </div>

      {/* Ficha */}
      {tab === 'ficha' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Datos técnicos del equipo</h3>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {[
              ['Código / TAG', eq.codigo], ['Nombre', eq.nombre], ['Tipo', eq.tipo],
              ['Marca', eq.marca], ['Modelo', eq.modelo], ['N° de serie', eq.numero_serie],
              ['Año', eq.anio != null ? String(eq.anio) : null], ['Patente', eq.patente],
              ['Potencia / Capacidad', eq.potencia], ['Cliente', eq.cliente?.nombre],
              ['Ubicación', eq.ubicacion], ['Puesta en servicio', eq.fecha_puesta_servicio ? formatDate(eq.fecha_puesta_servicio) : null],
              ['Horas de uso', eq.horas_uso != null ? `${eq.horas_uso.toLocaleString('es-AR')} h` : null],
              ['Registrado', formatDate(eq.created_at)],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string} className="flex gap-2 py-1.5 border-b border-slate-50">
                <dt className="text-xs text-slate-400 w-40 shrink-0">{k}</dt>
                <dd className="text-slate-700 font-medium text-sm">{v as string}</dd>
              </div>
            ))}
          </dl>
          {eq.observaciones && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Observaciones</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{eq.observaciones}</p>
            </div>
          )}
        </div>
      )}

      {/* Inspecciones */}
      {tab === 'inspecciones' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          {insps.length === 0 ? (
            <div className="p-10 text-center"><FileCheck2 className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-500">Sin inspecciones registradas</p></div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {insps.map(i => (
                <li key={i.id}>
                  <Link href={`/inspecciones/${i.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><span className="font-mono text-xs text-slate-400">{i.numero}</span><TipoInspeccionBadge tipo={i.tipo} /></div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(i.fecha)} · {i.inspector}</p>
                    </div>
                    <ResultadoBadge resultado={i.resultado} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Mantenimientos */}
      {tab === 'mantenimientos' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Historial de mantenimientos</h3>
            <p className="text-xs text-slate-500">Costo acumulado: <b className="text-slate-800">{formatARS(costoTotal)}</b></p>
          </div>
          {mants.length === 0 ? (
            <div className="p-10 text-center"><Wrench className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-500">Sin mantenimientos registrados</p></div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {mants.map(m => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">{m.tipo}</span>
                      <span className="text-xs text-slate-400">{formatDate(m.fecha)}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{m.descripcion}</p>
                    <p className="text-xs text-slate-400">Responsable: {m.responsable}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800 shrink-0">{formatARS(Number(m.costo ?? 0))}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Certificaciones */}
      {tab === 'certificaciones' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          {certs.length === 0 ? (
            <div className="p-10 text-center"><ShieldCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-500">Sin certificaciones</p></div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {certs.map(c => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{c.tipo}</p>
                    <p className="text-xs text-slate-400">{c.entidad} · N° {c.numero} · Vence {formatDate(c.fecha_vencimiento)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <CertEstadoBadge estado={c.estado} />
                    <VencimientoBadge dias={diasParaVencer(c.fecha_vencimiento)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
