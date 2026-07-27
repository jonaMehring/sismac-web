import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { VencimientoBadge } from '@/components/shared/StatusBadge'
import {
  EquipoEstadoBadge, CriticidadBadge, TipoInspeccionBadge, ResultadoBadge, CertEstadoBadge,
} from '@/components/inspecciones/Badges'
import { ClipboardCheck, Cog, Wrench, ShieldCheck, Plus, ArrowRight, CalendarClock, FileCheck2 } from 'lucide-react'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import type { InspEquipo, Inspeccion, Certificacion } from '@/lib/inspecciones/types'

export default async function InspeccionesPage() {
  const supabase = await createClient()

  const [
    { data: equipos },
    { data: inspecciones },
    { data: certificaciones },
  ] = await Promise.all([
    supabase.from('insp_equipos').select('*').order('codigo'),
    supabase.from('inspecciones').select('*').order('fecha', { ascending: false }),
    supabase.from('insp_certificaciones').select('*').order('fecha_vencimiento'),
  ])

  const eqs = (equipos ?? []) as unknown as InspEquipo[]
  const insps = (inspecciones ?? []) as unknown as Inspeccion[]
  const certs = (certificaciones ?? []) as unknown as Certificacion[]

  const operativos = eqs.filter(e => e.estado === 'operativo').length
  const enMantenimiento = eqs.filter(e => e.estado === 'mantenimiento').length
  const fueraServicio = eqs.filter(e => e.estado === 'fuera_servicio').length
  const inspVencidas = eqs.filter(e => e.proxima_inspeccion && diasParaVencer(e.proxima_inspeccion) < 0).length
  const inspProximas = eqs.filter(e => e.proxima_inspeccion && diasParaVencer(e.proxima_inspeccion) >= 0 && diasParaVencer(e.proxima_inspeccion) <= 15).length
  const certsVencidas = certs.filter(c => c.estado === 'vencido').length
  const certsPorVencer = certs.filter(c => c.estado === 'por_vencer').length

  const alerts = []
  if (fueraServicio > 0) alerts.push({ id: 'fuera', message: `${fueraServicio} equipo${fueraServicio > 1 ? 's' : ''} fuera de servicio — requieren intervención`, href: '#equipos', severity: 'critical' as const })
  if (inspVencidas > 0) alerts.push({ id: 'insp-venc', message: `${inspVencidas} equipo${inspVencidas > 1 ? 's' : ''} con inspección vencida`, href: '#equipos', severity: 'critical' as const })
  if (certsVencidas > 0) alerts.push({ id: 'cert-venc', message: `${certsVencidas} certificación${certsVencidas > 1 ? 'es' : ''} vencida${certsVencidas > 1 ? 's' : ''}`, href: '#certificaciones', severity: 'warning' as const })

  return (
    <div>
      <PageHeader
        title="Inspecciones de Equipos"
        description="Registro técnico, mantenimientos, estado y certificaciones"
        icon={ClipboardCheck}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inspecciones/equipos/nuevo"
              className="flex items-center gap-1.5 text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
              <Cog className="w-4 h-4" /> Nuevo equipo
            </Link>
            <Link href="/inspecciones/nueva"
              className="btn-brand flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl">
              <Plus className="w-4 h-4" /> Nueva inspección
            </Link>
          </div>
        }
      />

      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Equipos registrados" value={eqs.length} subtitle={`${operativos} operativos`} icon={Cog} iconColor="bg-blue-50 text-blue-600 ring-blue-100" accent />
        <StatCard title="En mantenimiento" value={enMantenimiento} subtitle={`${fueraServicio} fuera de servicio`} icon={Wrench} iconColor="bg-amber-50 text-amber-600 ring-amber-100" accent alert={fueraServicio > 0} />
        <StatCard title="Inspecciones vencidas" value={inspVencidas} subtitle={`${inspProximas} próximas (15 días)`} icon={CalendarClock} iconColor="bg-red-50 text-red-600 ring-red-100" accent alert={inspVencidas > 0} />
        <StatCard title="Certificaciones" value={certs.length} subtitle={`${certsPorVencer} por vencer · ${certsVencidas} vencidas`} icon={ShieldCheck} iconColor="bg-emerald-50 text-emerald-600 ring-emerald-100" accent alert={certsVencidas > 0} />
      </div>

      {/* Equipos */}
      <div id="equipos" className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Cog className="w-4 h-4 text-slate-400" /> Equipos ({eqs.length})
          </h2>
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
              {eqs.map(e => (
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspecciones recientes + Certificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-slate-400" /> Inspecciones recientes
            </h2>
            <Link href="/inspecciones/nueva" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Nueva <Plus className="w-3 h-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {insps.slice(0, 6).map(i => (
              <li key={i.id}>
                <Link href={`/inspecciones/${i.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{i.numero}</span>
                      <TipoInspeccionBadge tipo={i.tipo} />
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate mt-0.5">{i.equipo?.codigo} · {i.equipo?.nombre}</p>
                    <p className="text-xs text-slate-400">{formatDate(i.fecha)} · {i.inspector}</p>
                  </div>
                  <ResultadoBadge resultado={i.resultado} />
                </Link>
              </li>
            ))}
            {insps.length === 0 && <li className="text-sm text-slate-400 text-center py-8">Sin inspecciones registradas</li>}
          </ul>
        </div>

        <div id="certificaciones" className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" /> Certificaciones
            </h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {certs.map(c => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.tipo}</p>
                  <p className="text-xs text-slate-400 truncate">{c.equipo?.codigo} · {c.entidad} · N° {c.numero}</p>
                  <p className="text-xs text-slate-400">Vence: {formatDate(c.fecha_vencimiento)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <CertEstadoBadge estado={c.estado} />
                  <VencimientoBadge dias={diasParaVencer(c.fecha_vencimiento)} />
                </div>
              </li>
            ))}
            {certs.length === 0 && <li className="text-sm text-slate-400 text-center py-8">Sin certificaciones</li>}
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/inspecciones/nueva" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
          Cargar nueva planilla de inspección <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
