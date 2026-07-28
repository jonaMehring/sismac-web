'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createInspeccion } from '@/app/actions/inspecciones'
import {
  CHECKLIST_TEMPLATE, MEDICIONES_SUGERIDAS, ITEM_ESTADO_META,
  TIPO_INSPECCION_META, RESULTADO_META, ESTADO_RESULTANTE_META,
  calcularResultado, calcularEstadoResultante, REGLA_RESULTADO_TEXTO,
  type ItemEstado,
} from '@/lib/inspecciones/config'
import type { InspEquipo, InspFoto } from '@/lib/inspecciones/types'
import { cn } from '@/lib/utils/cn'
import {
  ClipboardCheck, Cog, ListChecks, Gauge, ClipboardList, Loader2, AlertCircle,
  Plus, Trash2, Save, ArrowLeft, Info, Camera, ImagePlus,
} from 'lucide-react'

const ITEM_ESTADOS: ItemEstado[] = ['conforme', 'observado', 'no_conforme', 'na']

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:bg-white focus:border-blue-400 transition-all'
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5'

function SectionCard({ icon: Icon, title, desc, children, tint = 'blue' }: {
  icon: React.ElementType; title: string; desc?: string; children: React.ReactNode; tint?: string
}) {
  const tints: Record<string, string> = {
    blue: 'from-blue-600 to-cyan-500', slate: 'from-slate-600 to-slate-800',
    amber: 'from-amber-500 to-orange-600', emerald: 'from-emerald-500 to-teal-600',
  }
  return (
    <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
        <span className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0', tints[tint])}>
          <Icon className="w-4 h-4" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-800 leading-tight">{title}</h2>
          {desc && <p className="text-xs text-slate-400">{desc}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function InspeccionForm({ equipos, inspectorDefault, equipoPreset }: {
  equipos: InspEquipo[]; inspectorDefault: string; equipoPreset?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const hoy = new Date().toISOString().split('T')[0]

  // Cabecera
  const [equipoId, setEquipoId] = useState(equipoPreset ?? '')
  const [tipo, setTipo] = useState<string>('preventiva')
  const [fecha, setFecha] = useState(hoy)
  const [inspector, setInspector] = useState(inspectorDefault)
  const [lugar, setLugar] = useState('')
  const [condicion, setCondicion] = useState('Detenida')

  // Checklist
  const [checklist, setChecklist] = useState(() =>
    CHECKLIST_TEMPLATE.map(c => ({ categoria: c.categoria, items: c.items.map(nombre => ({ nombre, estado: 'conforme' as ItemEstado, nota: '' })) }))
  )
  function setItem(ci: number, ii: number, patch: Partial<{ estado: ItemEstado; nota: string }>) {
    setChecklist(prev => prev.map((cat, i) => i !== ci ? cat : {
      ...cat, items: cat.items.map((it, j) => j !== ii ? it : { ...it, ...patch }),
    }))
  }

  // Mediciones
  const [mediciones, setMediciones] = useState(() =>
    MEDICIONES_SUGERIDAS.map(m => ({ ...m, valor: '', estado: 'conforme' as ItemEstado }))
  )
  function setMed(idx: number, patch: Partial<{ parametro: string; valor: string; unidad: string; rango: string; estado: ItemEstado }>) {
    setMediciones(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m))
  }
  const addMed = () => setMediciones(prev => [...prev, { parametro: '', valor: '', unidad: '', rango: '', estado: 'conforme' }])
  const delMed = (idx: number) => setMediciones(prev => prev.filter((_, i) => i !== idx))

  // Registro fotográfico
  const [fotos, setFotos] = useState<InspFoto[]>([])
  function addFotos(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setFotos(prev => [...prev, { url: String(reader.result), punto: '', descripcion: file.name.replace(/\.[^.]+$/, '') }])
      }
      reader.readAsDataURL(file)
    })
  }
  function setFoto(idx: number, patch: Partial<InspFoto>) {
    setFotos(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f))
  }
  const delFoto = (idx: number) => setFotos(prev => prev.filter((_, i) => i !== idx))

  // Resultado (auto-calculado según el checklist y las mediciones)
  const [observaciones, setObservaciones] = useState('')
  const [acciones, setAcciones] = useState('')
  const [proxima, setProxima] = useState('')
  const [requiereCert, setRequiereCert] = useState(false)

  const equipoSel = useMemo(() => equipos.find(e => e.id === equipoId), [equipos, equipoId])
  const puntosDisponibles = useMemo(() => checklist.flatMap(c => c.items.map(i => i.nombre)), [checklist])

  const resultado = useMemo(() => calcularResultado(checklist, mediciones), [checklist, mediciones])
  const estadoResultante = useMemo(() => calcularEstadoResultante(checklist, mediciones), [checklist, mediciones])

  // Resumen del checklist
  const resumen = useMemo(() => {
    const flat = checklist.flatMap(c => c.items)
    return {
      conforme: flat.filter(i => i.estado === 'conforme').length,
      observado: flat.filter(i => i.estado === 'observado').length,
      no_conforme: flat.filter(i => i.estado === 'no_conforme').length,
      na: flat.filter(i => i.estado === 'na').length,
      total: flat.length,
    }
  }, [checklist])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!equipoId) { setError('Seleccioná el equipo a inspeccionar'); return }
    const payload = {
      equipo_id: equipoId, tipo, inspector, fecha, lugar: lugar || null, condicion_operacion: condicion,
      resultado, estado_resultante: estadoResultante,
      observaciones: observaciones || null, acciones_correctivas: acciones || null,
      proxima_inspeccion: proxima || null, requiere_certificacion: requiereCert,
      checklist, mediciones, fotos,
    }
    startTransition(async () => {
      try {
        const created = await createInspeccion(payload)
        router.push(created?.id ? `/inspecciones/${created.id}` : '/inspecciones')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar la inspección')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-5">
      <div>
        <Link href="/inspecciones" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Volver a inspecciones
        </Link>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ClipboardCheck className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Planilla de inspección de equipo</h1>
            <p className="text-sm text-slate-400">Registro técnico completo: checklist, mediciones y resultado</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* 1. Equipo */}
      <SectionCard icon={Cog} title="Equipo a inspeccionar" desc="Seleccioná el equipo del registro" tint="slate">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Equipo *</label>
            <select value={equipoId} onChange={e => {
              const id = e.target.value; setEquipoId(id)
              const eq = equipos.find(x => x.id === id)
              if (eq?.ubicacion && !lugar) setLugar(eq.ubicacion)
            }} required className={inputCls}>
              <option value="">— Seleccionar equipo —</option>
              {equipos.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.codigo} · {eq.nombre} — {eq.cliente?.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        {equipoSel && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
            {[
              ['TAG', equipoSel.codigo], ['Tipo', equipoSel.tipo],
              ['Marca / Modelo', [equipoSel.marca, equipoSel.modelo].filter(Boolean).join(' ')],
              ['N° de serie', equipoSel.numero_serie], ['Cliente', equipoSel.cliente?.nombre],
              ['Ubicación', equipoSel.ubicacion], ['Potencia', equipoSel.potencia],
              ['Horas de uso', equipoSel.horas_uso != null ? `${equipoSel.horas_uso.toLocaleString('es-AR')} h` : '—'],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string}>
                <p className="text-[0.68rem] text-slate-400 uppercase tracking-wide">{k}</p>
                <p className="text-sm font-medium text-slate-700 truncate">{v as string}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 2. Datos de la inspección */}
      <SectionCard icon={ClipboardList} title="Datos de la inspección">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Tipo de inspección *</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputCls}>
              {Object.entries(TIPO_INSPECCION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fecha *</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Inspector responsable *</label>
            <input value={inspector} onChange={e => setInspector(e.target.value)} required className={inputCls} placeholder="Nombre del inspector" />
          </div>
          <div>
            <label className={labelCls}>Condición de operación</label>
            <select value={condicion} onChange={e => setCondicion(e.target.value)} className={inputCls}>
              <option>Detenida</option><option>En marcha</option><option>En prueba</option><option>Sin energía</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className={labelCls}>Lugar de la inspección</label>
            <input value={lugar} onChange={e => setLugar(e.target.value)} className={inputCls} placeholder="Planta / sector donde se realizó la inspección" />
          </div>
        </div>
      </SectionCard>

      {/* 3. Checklist técnico */}
      <SectionCard icon={ListChecks} title="Checklist técnico" desc="Evaluá cada punto: Conforme, Observado, No conforme o N/A" tint="blue">
        {/* Resumen */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['conforme', 'observado', 'no_conforme', 'na'] as ItemEstado[]).map(k => (
            <span key={k} className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', ITEM_ESTADO_META[k].cls)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', ITEM_ESTADO_META[k].dot)} />
              {ITEM_ESTADO_META[k].label}: {resumen[k]}
            </span>
          ))}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-500">
            Total: {resumen.total}
          </span>
        </div>

        <div className="space-y-5">
          {checklist.map((cat, ci) => (
            <div key={cat.categoria}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{cat.categoria}</h3>
              <div className="rounded-xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                {cat.items.map((item, ii) => (
                  <div key={item.nombre} className="px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-sm text-slate-700 flex-1 min-w-0">{item.nombre}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        {ITEM_ESTADOS.map(st => {
                          const active = item.estado === st
                          const m = ITEM_ESTADO_META[st]
                          return (
                            <button key={st} type="button" onClick={() => setItem(ci, ii, { estado: st })}
                              className={cn('px-3 py-1.5 text-xs font-semibold transition-colors',
                                active ? cn(m.cls, 'border-0') : 'text-slate-400 hover:bg-slate-50')}
                              title={m.label}>
                              {m.short}
                            </button>
                          )
                        })}
                      </div>
                      {(item.estado === 'observado' || item.estado === 'no_conforme') && (
                        <input value={item.nota} onChange={e => setItem(ci, ii, { nota: e.target.value })}
                          placeholder="Observación..."
                          className="w-40 sm:w-48 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Mediciones */}
      <SectionCard icon={Gauge} title="Mediciones técnicas" desc="Parámetros medidos durante la inspección" tint="emerald">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="pb-2 pr-2">Parámetro</th>
                <th className="pb-2 px-2 w-24">Valor</th>
                <th className="pb-2 px-2 w-24">Unidad</th>
                <th className="pb-2 px-2 w-28">Rango ref.</th>
                <th className="pb-2 px-2 w-36">Estado</th>
                <th className="pb-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {mediciones.map((m, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2"><input value={m.parametro} onChange={e => setMed(i, { parametro: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Parámetro" /></td>
                  <td className="py-1 px-2"><input value={m.valor} onChange={e => setMed(i, { valor: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="—" /></td>
                  <td className="py-1 px-2"><input value={m.unidad} onChange={e => setMed(i, { unidad: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></td>
                  <td className="py-1 px-2"><input value={m.rango} onChange={e => setMed(i, { rango: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></td>
                  <td className="py-1 px-2">
                    <select value={m.estado} onChange={e => setMed(i, { estado: e.target.value as ItemEstado })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      {ITEM_ESTADOS.map(st => <option key={st} value={st}>{ITEM_ESTADO_META[st].label}</option>)}
                    </select>
                  </td>
                  <td className="py-1 text-right">
                    <button type="button" onClick={() => delMed(i)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addMed} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
          <Plus className="w-4 h-4" /> Agregar medición
        </button>
      </SectionCard>

      {/* 5. Registro fotográfico */}
      <SectionCard icon={Camera} title="Registro fotográfico" desc="Adjuntá fotos y asociálas a un punto del checklist" tint="slate">
        <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 py-6 cursor-pointer transition-colors text-sm font-semibold text-slate-500">
          <ImagePlus className="w-5 h-5 text-blue-500" /> Agregar fotografías
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => { addFotos(e.target.files); e.target.value = '' }} />
        </label>

        {fotos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {fotos.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.descripcion ?? 'Foto'} className="w-full h-40 object-cover bg-slate-200" />
                <div className="p-3 space-y-2">
                  <input value={f.descripcion ?? ''} onChange={e => setFoto(i, { descripcion: e.target.value })}
                    placeholder="Descripción de la foto"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <div className="flex items-center gap-2">
                    <select value={f.punto ?? ''} onChange={e => setFoto(i, { punto: e.target.value })}
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Asociar a punto (opcional)</option>
                      {puntosDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button type="button" onClick={() => delFoto(i)} className="text-slate-300 hover:text-red-500 p-1.5 shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {fotos.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-3">Sin fotos cargadas. Durante la inspección podés sacar o subir fotos y vincularlas a cada punto.</p>
        )}
      </SectionCard>

      {/* 6. Resultado */}
      <SectionCard icon={ClipboardCheck} title="Resultado y conclusiones" tint="amber">
        {/* Resultado calculado automáticamente */}
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 mb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <Info className="w-3.5 h-3.5 text-blue-500" /> Resultado automático
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border', RESULTADO_META[resultado].cls)}>
                <span className={cn('w-2 h-2 rounded-full', RESULTADO_META[resultado].dot)} />
                {RESULTADO_META[resultado].label}
              </span>
              <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border', ESTADO_RESULTANTE_META[estadoResultante].cls)}>
                {ESTADO_RESULTANTE_META[estadoResultante].label}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">El sistema calcula el resultado según el checklist y las mediciones: {REGLA_RESULTADO_TEXTO}.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Observaciones generales</label>
            <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Detalle del estado general, hallazgos y comentarios del inspector..." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Acciones correctivas recomendadas</label>
            <textarea value={acciones} onChange={e => setAcciones(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Trabajos a realizar, repuestos, plazos..." />
          </div>
          <div>
            <label className={labelCls}>Próxima inspección</label>
            <input type="date" value={proxima} onChange={e => setProxima(e.target.value)} className={inputCls} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 w-full cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={requiereCert} onChange={e => setRequiereCert(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-slate-700 font-medium">Requiere certificación / habilitación</span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700/90">El estado del equipo se actualizará automáticamente según el resultado. Si es <b>Fuera de servicio</b>, el equipo se marcará para intervención.</p>
        </div>
      </SectionCard>

      {/* Acciones */}
      <div className="flex items-center gap-3 justify-end pb-4">
        <Link href="/inspecciones" className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</Link>
        <button type="submit" disabled={isPending} className="btn-brand inline-flex items-center gap-2 font-semibold py-2.5 px-5 rounded-xl disabled:opacity-70">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar inspección</>}
        </button>
      </div>
    </form>
  )
}
