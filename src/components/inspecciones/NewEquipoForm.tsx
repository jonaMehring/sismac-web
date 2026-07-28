'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEquipo } from '@/app/actions/inspecciones'
import { TIPOS_EQUIPO } from '@/lib/inspecciones/config'
import { Cog, Loader2, AlertCircle, Save, ArrowLeft, ImagePlus, X } from 'lucide-react'

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:bg-white focus:border-blue-400 transition-all'
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5'

export function NewEquipoForm({ clientes }: { clientes: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [foto, setFotoState] = useState<string | null>(null)

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFotoState(String(reader.result))
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const horas = fd.get('horas_uso') as string
    const anio = fd.get('anio') as string
    const data = {
      codigo: fd.get('codigo') as string,
      nombre: fd.get('nombre') as string,
      tipo: fd.get('tipo') as string,
      marca: (fd.get('marca') as string) || null,
      modelo: (fd.get('modelo') as string) || null,
      numero_serie: (fd.get('numero_serie') as string) || null,
      cliente_id: fd.get('cliente_id') as string,
      ubicacion: (fd.get('ubicacion') as string) || null,
      fecha_puesta_servicio: (fd.get('fecha_puesta_servicio') as string) || null,
      anio: anio ? Number(anio) : null,
      patente: (fd.get('patente') as string) || null,
      foto,
      estado: fd.get('estado') as 'operativo' | 'mantenimiento' | 'fuera_servicio' | 'baja',
      criticidad: fd.get('criticidad') as 'baja' | 'media' | 'alta' | 'critica',
      potencia: (fd.get('potencia') as string) || null,
      horas_uso: horas ? Number(horas) : null,
      observaciones: (fd.get('observaciones') as string) || null,
    }
    startTransition(async () => {
      try {
        const created = await createEquipo(data)
        router.push(created?.id ? `/inspecciones/equipos/${created.id}` : '/inspecciones')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al registrar el equipo')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/inspecciones" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver a inspecciones
      </Link>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
          <Cog className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Registrar equipo</h1>
          <p className="text-sm text-slate-400">Alta de equipo en el registro de inspecciones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Código / TAG *</label>
            <input name="codigo" required autoFocus className={inputCls} placeholder="Ej: MOT-011" />
          </div>
          <div>
            <label className={labelCls}>Tipo de equipo *</label>
            <select name="tipo" required className={inputCls} defaultValue="">
              <option value="" disabled>— Seleccionar —</option>
              {TIPOS_EQUIPO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Nombre / Descripción *</label>
            <input name="nombre" required className={inputCls} placeholder="Ej: Motor principal línea B" />
          </div>
          <div>
            <label className={labelCls}>Marca</label>
            <input name="marca" className={inputCls} placeholder="Ej: WEG" />
          </div>
          <div>
            <label className={labelCls}>Modelo</label>
            <input name="modelo" className={inputCls} placeholder="Ej: W22" />
          </div>
          <div>
            <label className={labelCls}>N° de serie</label>
            <input name="numero_serie" className={inputCls} placeholder="Ej: WEG-2024-00000" />
          </div>
          <div>
            <label className={labelCls}>Potencia / Capacidad</label>
            <input name="potencia" className={inputCls} placeholder="Ej: 30 kW" />
          </div>
          <div>
            <label className={labelCls}>Año</label>
            <input type="number" name="anio" min="1950" max="2100" className={inputCls} placeholder="Ej: 2021" />
          </div>
          <div>
            <label className={labelCls}>Patente <span className="text-slate-300">(si corresponde)</span></label>
            <input name="patente" className={inputCls} placeholder="Ej: AB 123 CD" />
          </div>
          <div>
            <label className={labelCls}>Cliente *</label>
            <select name="cliente_id" required className={inputCls} defaultValue="">
              <option value="" disabled>— Seleccionar cliente —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Ubicación</label>
            <input name="ubicacion" className={inputCls} placeholder="Ej: Planta — Línea B" />
          </div>
          <div>
            <label className={labelCls}>Estado *</label>
            <select name="estado" required className={inputCls} defaultValue="operativo">
              <option value="operativo">Operativo</option>
              <option value="mantenimiento">En mantenimiento</option>
              <option value="fuera_servicio">Fuera de servicio</option>
              <option value="baja">Dado de baja</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Criticidad *</label>
            <select name="criticidad" required className={inputCls} defaultValue="media">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Puesta en servicio</label>
            <input type="date" name="fecha_puesta_servicio" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Horas de uso</label>
            <input type="number" name="horas_uso" min="0" className={inputCls} placeholder="Ej: 12000" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Observaciones</label>
            <textarea name="observaciones" rows={2} className={`${inputCls} resize-none`} placeholder="Notas de la ficha técnica del equipo..." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Fotografía del equipo</label>
            {foto ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt="Equipo" className="h-40 rounded-xl border border-slate-200 object-cover" />
                <button type="button" onClick={() => setFotoState(null)} className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-red-50">
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 py-6 cursor-pointer transition-colors text-sm font-semibold text-slate-500">
                <ImagePlus className="w-5 h-5 text-blue-500" /> Subir fotografía
                <input type="file" accept="image/*" className="hidden" onChange={onFoto} />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <Link href="/inspecciones" className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</Link>
          <button type="submit" disabled={isPending} className="btn-brand inline-flex items-center gap-2 font-semibold py-2.5 px-5 rounded-xl disabled:opacity-70">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Registrar equipo</>}
          </button>
        </div>
      </form>
    </div>
  )
}
