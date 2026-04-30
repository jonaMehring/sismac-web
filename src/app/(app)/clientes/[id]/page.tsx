import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { TaskStatusBadge, DocumentStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cliente) notFound()

  const [
    { data: tareas },
    { data: documentos },
    { data: facturas },
    { data: sectores },
  ] = await Promise.all([
    supabase.from('tasks')
      .select('id, titulo, estado, prioridad, fecha_limite')
      .eq('cliente_id', id)
      .in('estado', ['pendiente', 'en_curso', 'demorada'])
      .order('fecha_limite')
      .limit(10),
    supabase.from('client_documents')
      .select('id, nombre_archivo, fecha_vencimiento, estado, document_type:document_types(nombre)')
      .eq('cliente_id', id)
      .neq('estado', 'renovado')
      .order('fecha_vencimiento')
      .limit(10),
    supabase.from('invoices')
      .select('id, numero, total, estado, fecha_vencimiento')
      .eq('cliente_id', id)
      .order('fecha_emision', { ascending: false })
      .limit(5),
    supabase.from('sectores')
      .select('id, nombre, equipos(id, nombre, estado)')
      .eq('cliente_id', id),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/clientes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Volver a clientes
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{cliente.nombre}</h1>
            {cliente.razon_social && <p className="text-sm text-slate-500">{cliente.razon_social}</p>}
            {cliente.cuit && <p className="text-xs text-slate-400 mt-0.5">CUIT: {cliente.cuit}</p>}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cliente.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100 text-sm">
          {cliente.email && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{cliente.email}</span>
            </div>
          )}
          {cliente.telefono && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{cliente.telefono}</span>
            </div>
          )}
          {(cliente.localidad || cliente.provincia) && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{[cliente.localidad, cliente.provincia].filter(Boolean).join(', ')}</span>
            </div>
          )}
          <div className="text-slate-400 text-xs">
            Cliente desde {formatDate(cliente.created_at)}
          </div>
        </div>

        {cliente.contacto_nombre && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm">
            <p className="text-xs text-slate-400 mb-1">Contacto principal</p>
            <p className="font-medium text-slate-700">{cliente.contacto_nombre}</p>
            {cliente.contacto_email && <p className="text-slate-500 text-xs">{cliente.contacto_email}</p>}
            {cliente.contacto_telefono && <p className="text-slate-500 text-xs">{cliente.contacto_telefono}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tareas activas */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Tareas activas</h2>
            <Link href={`/bpm/tareas?cliente=${id}`} className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {(tareas ?? []).length === 0 ? (
              <li className="text-sm text-slate-400 text-center py-6">Sin tareas activas</li>
            ) : (
              (tareas as unknown as Array<{ id: string; titulo: string; estado: string }> ?? []).map(t => (
                <li key={t.id}>
                  <Link href={`/bpm/tareas/${t.id}`} className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-slate-50">
                    <p className="text-sm text-slate-700 truncate">{t.titulo}</p>
                    <TaskStatusBadge status={t.estado as import('@/lib/types').TaskStatus} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Documentación</h2>
            <Link href={`/compliance/documentos?cliente=${id}`} className="text-xs text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {(documentos ?? []).length === 0 ? (
              <li className="text-sm text-slate-400 text-center py-6">Sin documentos</li>
            ) : (
              (documentos as unknown as {
                id: string
                nombre_archivo: string
                fecha_vencimiento: string
                estado: string
                document_type?: { nombre: string } | null
              }[]).map(d => (
                <li key={d.id}>
                  <Link href={`/compliance/documentos/${d.id}`} className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 truncate">{d.document_type?.nombre ?? d.nombre_archivo}</p>
                      <p className="text-xs text-slate-400">Vto: {formatDate(d.fecha_vencimiento)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <VencimientoBadge dias={diasParaVencer(d.fecha_vencimiento)} />
                      <DocumentStatusBadge status={d.estado as import('@/lib/types').DocumentStatus} />
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Facturas */}
        {(facturas ?? []).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 text-sm">Últimas facturas</h2>
              <Link href={`/finanzas/facturas?cliente=${id}`} className="text-xs text-blue-600 hover:underline">Ver todas</Link>
            </div>
            <ul className="divide-y divide-slate-50">
              {(facturas as unknown as Array<{ id: string; numero: string; total: number; estado: string }> ?? []).map(f => (
                <li key={f.id}>
                  <Link href={`/finanzas/facturas/${f.id}`} className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-slate-50">
                    <p className="text-sm font-medium text-blue-600">{f.numero}</p>
                    <p className="text-sm text-slate-600">{f.estado}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sectores y equipos */}
        {(sectores ?? []).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 text-sm">Sectores y equipos</h2>
            </div>
            <ul className="divide-y divide-slate-50">
              {(sectores as unknown as { id: string; nombre: string; equipos?: { id: string; nombre: string; estado: string }[] }[]).map(s => (
                <li key={s.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-800 mb-1">{s.nombre}</p>
                  {(s.equipos ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.equipos!.map(e => (
                        <span key={e.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {e.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
