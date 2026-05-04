import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Edit, Plus,
  FileText, ClipboardList, DollarSign, Users, Wrench, LayoutGrid,
  CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { TaskStatusBadge, DocumentStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'
import { SectoresEquipos } from '@/components/clientes/SectoresEquipos'
import { ServicioTimeline } from '@/components/clientes/ServicioTimeline'
import { ContactosList } from '@/components/clientes/ContactosList'
import type { Sector, Equipo, ConsumanEntry, ClienteContacto, Budget } from '@/lib/types'

const TABS = [
  { key: 'resumen',   label: 'Resumen',           Icon: LayoutGrid },
  { key: 'sectores',  label: 'Sectores & Equipos', Icon: Building2 },
  { key: 'documentos',label: 'Documentos',         Icon: FileText },
  { key: 'servicios', label: 'Servicios',          Icon: Wrench },
  { key: 'finanzas',  label: 'Finanzas',           Icon: DollarSign },
  { key: 'contactos', label: 'Contactos',          Icon: Users },
  { key: 'tareas',    label: 'Tareas',             Icon: ClipboardList },
]

const BUDGET_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  borrador:  { label: 'Borrador',  cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  enviado:   { label: 'Enviado',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  aprobado:  { label: 'Aprobado',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rechazado: { label: 'Rechazado', cls: 'bg-red-50 text-red-700 border-red-200' },
  vencido:   { label: 'Vencido',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  convertido:{ label: 'Convertido',cls: 'bg-purple-50 text-purple-700 border-purple-200' },
}

export default async function ClienteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab = 'resumen' } = await searchParams
  const supabase = await createClient()

  const { data: cliente } = await supabase.from('clientes').select('*').eq('id', id).single()
  if (!cliente) notFound()

  const [
    { data: sectoresRaw },
    { data: documentos },
    { data: servicios },
    { data: presupuestos },
    { data: tareas },
    { data: contactos },
  ] = await Promise.all([
    supabase.from('sectores')
      .select('*, equipos(*)')
      .eq('cliente_id', id)
      .eq('activo', true)
      .order('nombre'),
    supabase.from('client_documents')
      .select('*, document_type:document_types(nombre)')
      .eq('cliente_id', id)
      .neq('estado', 'renovado')
      .order('fecha_vencimiento'),
    supabase.from('consuman_entries')
      .select('*, equipo:equipos(nombre)')
      .eq('cliente_id', id)
      .order('fecha', { ascending: false }),
    supabase.from('budgets')
      .select('id, numero, titulo, total, estado, fecha_emision, fecha_validez, moneda')
      .eq('cliente_id', id)
      .in('estado', ['borrador', 'enviado', 'aprobado'])
      .order('fecha_emision', { ascending: false }),
    supabase.from('tasks')
      .select('id, titulo, estado, prioridad, fecha_limite, proceso_id')
      .eq('cliente_id', id)
      .in('estado', ['pendiente', 'en_curso', 'demorada'])
      .order('fecha_limite'),
    supabase.from('cliente_contactos')
      .select('*')
      .eq('cliente_id', id)
      .eq('activo', true)
      .order('es_principal', { ascending: false }),
  ])

  type SectorWithEquipos = Sector & { equipos: Equipo[] }
  const sectores = (sectoresRaw ?? []) as unknown as SectorWithEquipos[]

  // KPIs
  const docsVencidos = (documentos ?? []).filter((d: { estado: string }) => d.estado === 'vencido').length
  const docsPorVencer = (documentos ?? []).filter((d: { estado: string }) => d.estado === 'por_vencer').length
  const tareasActivas = (tareas ?? []).length
  const proximaRevision = sectores
    .flatMap(s => s.equipos ?? [])
    .filter(e => e.proxima_revision)
    .map(e => e.proxima_revision as string)
    .sort()[0]

  const complianceStatus = docsVencidos > 0 ? 'danger' : docsPorVencer > 0 ? 'warning' : 'ok'
  const complianceIcon = complianceStatus === 'danger' ? XCircle : complianceStatus === 'warning' ? AlertTriangle : CheckCircle2
  const ComplianceIcon = complianceIcon

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <div className="mb-4">
        <Link href="/clientes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a clientes
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xl shrink-0">
            {cliente.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{cliente.nombre}</h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                cliente.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {cliente.razon_social && <p className="text-sm text-slate-500 mt-0.5">{cliente.razon_social}</p>}
            {cliente.cuit && <p className="text-xs text-slate-400 mt-0.5">CUIT: {cliente.cuit}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/bpm/tareas/nueva?cliente_id=${id}`}
              className="flex items-center gap-1.5 text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
              <Plus className="w-4 h-4" /> Nueva tarea
            </Link>
            <Link href={`/clientes/${id}/editar`}
              className="flex items-center gap-1.5 text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
              <Edit className="w-4 h-4" /> Editar
            </Link>
          </div>
        </div>

        {/* Contact info row */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 pt-4 border-t border-slate-50 text-sm text-slate-500">
          {cliente.email && (
            <a href={`mailto:${cliente.email}`} className="flex items-center gap-1.5 hover:text-cyan-600 transition-colors">
              <Mail className="w-3.5 h-3.5" /> {cliente.email}
            </a>
          )}
          {cliente.telefono && (
            <a href={`tel:${cliente.telefono}`} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
              <Phone className="w-3.5 h-3.5" /> {cliente.telefono}
            </a>
          )}
          {(cliente.localidad || cliente.provincia) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {[cliente.direccion, cliente.localidad, cliente.provincia].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        {/* KPI chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className={`rounded-xl border px-3 py-2.5 flex items-center gap-2.5 ${
            complianceStatus === 'danger' ? 'bg-red-50 border-red-200' :
            complianceStatus === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <ComplianceIcon className={`w-5 h-5 shrink-0 ${
              complianceStatus === 'danger' ? 'text-red-500' :
              complianceStatus === 'warning' ? 'text-amber-500' : 'text-emerald-500'
            }`} />
            <div>
              <p className="text-xs text-slate-500">Documentos</p>
              <p className="text-sm font-bold text-slate-800">
                {docsVencidos > 0 ? `${docsVencidos} vencido${docsVencidos !== 1 ? 's' : ''}` :
                 docsPorVencer > 0 ? `${docsPorVencer} por vencer` : 'Al día'}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Tareas activas</p>
              <p className="text-sm font-bold text-slate-800">{tareasActivas}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Presupuestos</p>
              <p className="text-sm font-bold text-slate-800">{(presupuestos ?? []).length} en curso</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Próx. revisión</p>
              <p className="text-sm font-bold text-slate-800">
                {proximaRevision
                  ? new Date(proximaRevision).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs nav */}
      <div className="flex gap-1 overflow-x-auto bg-white rounded-2xl border border-slate-100 p-1 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        {TABS.map(({ key, label, Icon }) => (
          <Link
            key={key}
            href={`/clientes/${id}?tab=${key}`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === key
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {/* ── RESUMEN ── */}
        {tab === 'resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Datos de la empresa</h3>
              <dl className="space-y-2 text-sm">
                {[
                  ['Nombre comercial', cliente.nombre],
                  ['Razón social', cliente.razon_social],
                  ['CUIT', cliente.cuit],
                  ['Email', cliente.email],
                  ['Teléfono', cliente.telefono],
                  ['Dirección', cliente.direccion],
                  ['Localidad', cliente.localidad],
                  ['Provincia', cliente.provincia],
                  ['Cliente desde', formatDate(cliente.created_at)],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string} className="flex gap-2">
                    <dt className="text-xs text-slate-400 w-32 shrink-0">{label}</dt>
                    <dd className="text-slate-700 font-medium text-xs break-all">{value as string}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {cliente.notas && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Notas internas</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{cliente.notas}</p>
              </div>
            )}

            {(tareas ?? []).length > 0 && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tareas activas</h3>
                  <Link href={`/clientes/${id}?tab=tareas`} className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold">Ver todas</Link>
                </div>
                <ul className="divide-y divide-slate-50">
                  {(tareas ?? []).slice(0, 5).map((t: { id: string; titulo: string; estado: string }) => (
                    <li key={t.id}>
                      <Link href={`/bpm/tareas/${t.id}`} className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-slate-50 transition-colors">
                        <p className="text-sm text-slate-700 truncate">{t.titulo}</p>
                        <TaskStatusBadge status={t.estado as import('@/lib/types').TaskStatus} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── SECTORES & EQUIPOS ── */}
        {tab === 'sectores' && (
          <SectoresEquipos sectores={sectores} clienteId={id} />
        )}

        {/* ── DOCUMENTOS ── */}
        {tab === 'documentos' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Link href={`/compliance/documentos/nuevo?cliente_id=${id}`}
                className="flex items-center gap-1.5 text-sm text-slate-700 font-semibold border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors">
                <Plus className="w-4 h-4" /> Cargar documento
              </Link>
            </div>
            {(documentos ?? []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Sin documentos cargados</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Documento</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Vencimiento</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(documentos as unknown as {
                      id: string
                      nombre_archivo: string
                      fecha_vencimiento: string
                      estado: string
                      document_type?: { nombre: string } | null
                    }[]).map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/compliance/documentos/${d.id}`} className="font-medium text-slate-700 hover:text-cyan-600 transition-colors">
                            {d.document_type?.nombre ?? d.nombre_archivo}
                          </Link>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell text-slate-500 text-xs">{formatDate(d.fecha_vencimiento)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <VencimientoBadge dias={diasParaVencer(d.fecha_vencimiento)} />
                            <DocumentStatusBadge status={d.estado as import('@/lib/types').DocumentStatus} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SERVICIOS ── */}
        {tab === 'servicios' && (
          <ServicioTimeline
            entries={(servicios ?? []) as unknown as ConsumanEntry[]}
            clienteId={id}
            sectores={sectores}
          />
        )}

        {/* ── FINANZAS ── */}
        {tab === 'finanzas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{(presupuestos ?? []).length} presupuesto{(presupuestos ?? []).length !== 1 ? 's' : ''} en curso</p>
              <Link href={`/finanzas/presupuestos/nuevo?cliente_id=${id}`}
                className="flex items-center gap-1.5 text-sm text-slate-700 font-semibold border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors">
                <Plus className="w-4 h-4" /> Nuevo presupuesto
              </Link>
            </div>
            {(presupuestos ?? []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Sin presupuestos en curso</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(presupuestos as unknown as Budget[]).map(p => {
                  const st = BUDGET_STATUS_LABEL[p.estado] ?? BUDGET_STATUS_LABEL.borrador
                  return (
                    <Link key={p.id} href={`/finanzas/presupuestos/${p.id}`}
                      className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-cyan-300 transition-all"
                      style={{ boxShadow: 'var(--shadow-card)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-400 font-mono">{p.numero}</p>
                          <p className="font-semibold text-slate-800 text-sm mt-0.5 line-clamp-2">{p.titulo}</p>
                        </div>
                        <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 shrink-0 ${st.cls}`}>{st.label}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <p className="font-bold text-slate-800">
                          {p.moneda} {p.total.toLocaleString('es-AR')}
                        </p>
                        {p.fecha_validez && (
                          <p className="text-xs text-slate-400">Válido hasta {formatDate(p.fecha_validez)}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            <div className="text-center pt-2">
              <Link href={`/finanzas/presupuestos?cliente=${id}`} className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
                Ver historial completo →
              </Link>
            </div>
          </div>
        )}

        {/* ── CONTACTOS ── */}
        {tab === 'contactos' && (
          <ContactosList
            contactos={(contactos ?? []) as unknown as ClienteContacto[]}
            clienteId={id}
          />
        )}

        {/* ── TAREAS ── */}
        {tab === 'tareas' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Link href={`/bpm/tareas/nueva?cliente_id=${id}`}
                className="flex items-center gap-1.5 text-sm text-slate-700 font-semibold border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors">
                <Plus className="w-4 h-4" /> Nueva tarea
              </Link>
            </div>
            {(tareas ?? []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Sin tareas activas</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                <ul className="divide-y divide-slate-50">
                  {(tareas as unknown as Array<{ id: string; titulo: string; estado: string; prioridad: string; fecha_limite: string | null }>).map(t => (
                    <li key={t.id}>
                      <Link href={`/bpm/tareas/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{t.titulo}</p>
                          {t.fecha_limite && (
                            <p className="text-xs text-slate-400 mt-0.5">Vence: {formatDate(t.fecha_limite)}</p>
                          )}
                        </div>
                        <TaskStatusBadge status={t.estado as import('@/lib/types').TaskStatus} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
