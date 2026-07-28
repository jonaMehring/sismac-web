import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Cog, Calendar, User, Activity, ClipboardCheck, Gauge, ListChecks,
  FileText, ShieldCheck, CalendarClock, MapPin, Camera,
} from 'lucide-react'
import { PrintButton } from '@/components/inspecciones/PrintButton'
import { formatDate } from '@/lib/utils/dates'
import {
  TipoInspeccionBadge, ResultadoBadge, EstadoResultanteBadge, ItemEstadoBadge,
} from '@/components/inspecciones/Badges'
import { ITEM_ESTADO_META } from '@/lib/inspecciones/config'
import { cn } from '@/lib/utils/cn'
import type { Inspeccion } from '@/lib/inspecciones/types'

export default async function InspeccionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase.from('inspecciones').select('*').eq('id', id).single()
  if (!data) notFound()
  const insp = data as unknown as Inspeccion

  const checklist = insp.checklist ?? []
  const mediciones = insp.mediciones ?? []
  const flat = checklist.flatMap(c => c.items)
  const resumen = {
    conforme: flat.filter(i => i.estado === 'conforme').length,
    observado: flat.filter(i => i.estado === 'observado').length,
    no_conforme: flat.filter(i => i.estado === 'no_conforme').length,
    na: flat.filter(i => i.estado === 'na').length,
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between no-print">
        <Link href="/inspecciones" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver a inspecciones
        </Link>
        <PrintButton />
      </div>

      {/* Encabezado del informe */}
      <div className="rounded-2xl overflow-hidden mb-5 border border-slate-100" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="brand-surface px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[#7DD3FC] text-xs font-semibold uppercase tracking-[0.16em] mb-1 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" /> Informe de inspección
            </p>
            <h1 className="text-2xl font-bold text-white tracking-tight">{insp.numero}</h1>
            <p className="text-white/50 text-sm mt-1">{insp.equipo?.codigo} · {insp.equipo?.nombre}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ResultadoBadge resultado={insp.resultado} />
            <TipoInspeccionBadge tipo={insp.tipo} />
          </div>
        </div>
        <div className="bg-white grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-50">
          {[
            { icon: Calendar, label: 'Fecha', value: formatDate(insp.fecha) },
            { icon: User, label: 'Inspector', value: insp.inspector },
            { icon: Activity, label: 'Condición', value: insp.condicion_operacion ?? '—' },
            { icon: Cog, label: 'Cliente', value: insp.cliente?.nombre ?? '—' },
          ].map(m => (
            <div key={m.label} className="px-4 py-3">
              <p className="text-[0.68rem] text-slate-400 uppercase tracking-wide flex items-center gap-1"><m.icon className="w-3 h-3" /> {m.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{m.value}</p>
            </div>
          ))}
        </div>
        {insp.lugar && (
          <div className="bg-white px-4 py-2.5 border-t border-slate-50 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[0.68rem] text-slate-400 uppercase tracking-wide">Lugar:</span>
            <span className="text-sm font-medium text-slate-700 truncate">{insp.lugar}</span>
          </div>
        )}
      </div>

      {/* Estado resultante + resumen */}
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Estado resultante</p>
          <EstadoResultanteBadge estado={insp.estado_resultante} />
        </div>
        <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Resumen del checklist</p>
          <div className="flex flex-wrap gap-2">
            {(['conforme', 'observado', 'no_conforme', 'na'] as const).map(k => (
              <span key={k} className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', ITEM_ESTADO_META[k].cls)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', ITEM_ESTADO_META[k].dot)} />
                {ITEM_ESTADO_META[k].label}: {resumen[k]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
          <ListChecks className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-800">Checklist técnico</h2>
        </div>
        <div className="p-5 space-y-5">
          {checklist.map(cat => (
            <div key={cat.categoria}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{cat.categoria}</h3>
              <div className="rounded-xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                {cat.items.map(item => (
                  <div key={item.nombre} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700">{item.nombre}</p>
                      {item.nota && <p className="text-xs text-amber-600 mt-0.5">↳ {item.nota}</p>}
                    </div>
                    <ItemEstadoBadge estado={item.estado} className="shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {checklist.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sin checklist registrado</p>}
        </div>
      </div>

      {/* Mediciones */}
      {mediciones.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <Gauge className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Mediciones técnicas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-2.5">Parámetro</th>
                  <th className="px-5 py-2.5">Valor</th>
                  <th className="px-5 py-2.5">Rango ref.</th>
                  <th className="px-5 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mediciones.map((m, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2.5 text-slate-700">{m.parametro}</td>
                    <td className="px-5 py-2.5 font-semibold text-slate-800">{m.valor} <span className="text-slate-400 font-normal">{m.unidad}</span></td>
                    <td className="px-5 py-2.5 text-slate-500">{m.rango || '—'}</td>
                    <td className="px-5 py-2.5"><ItemEstadoBadge estado={m.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Registro fotográfico */}
      {(insp.fotos ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <Camera className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Registro fotográfico</h2>
            <span className="text-xs text-slate-400">({(insp.fotos ?? []).length})</span>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(insp.fotos ?? []).map((f, i) => (
              <figure key={i} className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.descripcion ?? 'Fotografía'} className="w-full h-44 object-cover bg-slate-200" />
                <figcaption className="p-3">
                  {f.punto && <span className="inline-block text-[0.68rem] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 mb-1">{f.punto}</span>}
                  <p className="text-xs text-slate-600 leading-snug">{f.descripcion}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Conclusiones */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
          <FileText className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-800">Conclusiones</h2>
        </div>
        <div className="p-5 space-y-4">
          {insp.observaciones && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Observaciones generales</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{insp.observaciones}</p>
            </div>
          )}
          {insp.acciones_correctivas && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Acciones correctivas recomendadas</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{insp.acciones_correctivas}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {insp.proxima_inspeccion && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5">
                <CalendarClock className="w-4 h-4 text-blue-500" /> Próxima inspección: <b className="text-slate-800">{formatDate(insp.proxima_inspeccion)}</b>
              </span>
            )}
            {insp.requiere_certificacion && (
              <span className="inline-flex items-center gap-1.5 text-sm text-cyan-700 border border-cyan-200 bg-cyan-50 rounded-xl px-3 py-1.5">
                <ShieldCheck className="w-4 h-4" /> Requiere certificación / habilitación
              </span>
            )}
          </div>

          {/* Firma */}
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-end justify-between">
            <div>
              <div className="w-48 border-b border-slate-300 mb-1" />
              <p className="text-xs text-slate-500">{insp.inspector} — Inspector responsable</p>
            </div>
            <p className="text-xs text-slate-300">Ingesar · {insp.numero}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
