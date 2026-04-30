'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { uploadClientDocument } from '@/app/actions/compliance'

interface Props {
  clientes: { id: string; nombre: string }[]
  tiposDoc: { id: string; nombre: string; alerta_dias_30: boolean; obligatorio: boolean }[]
}

export function UploadDocumentForm({ clientes, tiposDoc }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      cliente_id: fd.get('cliente_id') as string,
      document_type_id: fd.get('document_type_id') as string,
      nombre_archivo: fd.get('nombre_archivo') as string,
      archivo_url: fd.get('archivo_url') as string || undefined,
      fecha_emision: fd.get('fecha_emision') as string || undefined,
      fecha_vencimiento: fd.get('fecha_vencimiento') as string,
      notas: fd.get('notas') as string || undefined,
    }
    startTransition(async () => {
      try {
        await uploadClientDocument(data)
        router.push('/compliance/documentos')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el documento')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente *</label>
          <select
            name="cliente_id"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de documento *</label>
          <select
            name="document_type_id"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          >
            <option value="">Seleccionar tipo</option>
            {tiposDoc.map(t => (
              <option key={t.id} value={t.id}>
                {t.nombre}{t.obligatorio ? ' *' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del archivo *</label>
        <input
          name="nombre_archivo"
          required
          autoFocus
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          placeholder="Ej: ART_Empresa_2024.pdf"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">URL del archivo</label>
        <input
          name="archivo_url"
          type="url"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="https://... (link al documento en Drive, Storage, etc.)"
        />
        <p className="text-xs text-slate-400 mt-1">Opcional — pega el link del archivo ya subido</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de emisión</label>
          <input
            type="date"
            name="fecha_emision"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de vencimiento *</label>
          <input
            type="date"
            name="fecha_vencimiento"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas</label>
        <textarea
          name="notas"
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Observaciones adicionales..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
        >
          {isPending ? 'Guardando...' : 'Cargar documento'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
