import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/shared/StatCard'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { formatARS } from '@/lib/utils/currency'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { CheckSquare, DollarSign, Shield, FileText, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'
import { TaskStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'
import type { Task, Invoice, ClientDocument } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!perfil) redirect('/login')

  // Cargar datos según rol
  const [
    { data: tareasActivas },
    { data: tareasVencidas },
    { data: facturasPendientes },
    { data: documentosAlerta },
    { data: gastosDelMes },
    { data: presupuestosActivos },
  ] = await Promise.all([
    supabase.from('tasks').select('id').in('estado', ['pendiente', 'en_curso']).limit(100),
    supabase.from('tasks').select('id, titulo, asignado_a, cliente_id, fecha_limite, estado, prioridad, clientes(nombre)')
      .eq('estado', 'demorada').order('fecha_limite').limit(10),
    supabase.from('invoices').select('id, numero, total, fecha_vencimiento, cliente_id, clientes(nombre)')
      .in('estado', ['emitida', 'enviada', 'vencida']).order('fecha_vencimiento').limit(10),
    supabase.from('client_documents')
      .select('id, fecha_vencimiento, cliente_id, clientes(nombre), document_types(nombre)')
      .in('estado', ['por_vencer', 'vencido']).order('fecha_vencimiento').limit(10),
    supabase.from('expenses')
      .select('monto')
      .gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    supabase.from('budgets').select('id').in('estado', ['borrador', 'enviado']).limit(100),
  ])

  const totalGastos = ((gastosDelMes ?? []) as { monto: number }[]).reduce((sum, e) => sum + Number(e.monto), 0)
  const factVencidas = ((facturasPendientes ?? []) as { fecha_vencimiento: string }[]).filter(f => {
    const dias = diasParaVencer(f.fecha_vencimiento)
    return dias < 0
  })
  const docVencidos = ((documentosAlerta ?? []) as { fecha_vencimiento: string }[]).filter(d => diasParaVencer(d.fecha_vencimiento) < 0)

  const alerts = []
  if (docVencidos.length > 0) alerts.push({ id: 'doc-vencidos', message: `${docVencidos.length} documento${docVencidos.length > 1 ? 's' : ''} vencido${docVencidos.length > 1 ? 's' : ''} — requieren renovación inmediata`, href: '/compliance/documentos', severity: 'critical' as const })
  if (factVencidas.length > 0) alerts.push({ id: 'fact-vencidas', message: `${factVencidas.length} factura${factVencidas.length > 1 ? 's' : ''} vencida${factVencidas.length > 1 ? 's' : ''} sin cobrar`, href: '/finanzas/facturas', severity: 'critical' as const })
  if ((tareasVencidas?.length ?? 0) > 0) alerts.push({ id: 'tareas-demo', message: `${tareasVencidas?.length} tarea${(tareasVencidas?.length ?? 0) > 1 ? 's' : ''} demorada${(tareasVencidas?.length ?? 0) > 1 ? 's' : ''}`, href: '/bpm/tareas', severity: 'warning' as const })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Panel de control</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen general del sistema</p>
      </div>

      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Tareas activas"
          value={tareasActivas?.length ?? 0}
          subtitle={`${tareasVencidas?.length ?? 0} demoradas`}
          icon={CheckSquare}
          iconColor="bg-blue-100 text-blue-600"
          alert={(tareasVencidas?.length ?? 0) > 0}
        />
        <StatCard
          title="Facturas pendientes"
          value={(facturasPendientes ?? []).length}
          subtitle={`${factVencidas.length} vencidas`}
          icon={DollarSign}
          iconColor="bg-green-100 text-green-600"
          alert={factVencidas.length > 0}
        />
        <StatCard
          title="Docs. por vencer"
          value={(documentosAlerta ?? []).length}
          subtitle={`${docVencidos.length} vencidos hoy`}
          icon={Shield}
          iconColor="bg-orange-100 text-orange-600"
          alert={docVencidos.length > 0}
        />
        <StatCard
          title="Gastos del mes"
          value={formatARS(totalGastos)}
          subtitle={`${presupuestosActivos?.length ?? 0} presupuestos activos`}
          icon={FileText}
          iconColor="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas demoradas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              Tareas demoradas
            </h2>
            <Link href="/bpm/tareas" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          {(tareasVencidas ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Sin tareas demoradas</p>
          ) : (
            <ul className="space-y-2">
              {(tareasVencidas as unknown as Task[]).map((t: Task) => (
                <li key={t.id}>
                  <Link href={`/bpm/tareas/${t.id}`} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.titulo}</p>
                      {t.fecha_limite && (
                        <p className="text-xs text-red-500 mt-0.5">Venció el {formatDate(t.fecha_limite)}</p>
                      )}
                    </div>
                    <TaskStatusBadge status={t.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Vencimientos próximos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Vencimientos
            </h2>
            <Link href="/compliance/calendario" className="text-xs text-blue-600 hover:underline">Ver calendario</Link>
          </div>

          {/* Documentos */}
          {(documentosAlerta ?? []).length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Documentos</p>
              <ul className="space-y-1">
                {(documentosAlerta as unknown as ClientDocument[]).slice(0, 5).map(d => (
                  <li key={d.id}>
                    <Link href={`/compliance/documentos/${d.id}`} className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-slate-50">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{(d as ClientDocument & { clientes?: { nombre: string } }).clientes?.nombre}</p>
                        <p className="text-xs text-slate-400">{(d as ClientDocument & { document_types?: { nombre: string } }).document_types?.nombre}</p>
                      </div>
                      <VencimientoBadge dias={diasParaVencer(d.fecha_vencimiento)} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Facturas */}
          {(facturasPendientes ?? []).length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Facturas</p>
              <ul className="space-y-1">
                {(facturasPendientes as unknown as Invoice[]).slice(0, 5).map(f => (
                  <li key={f.id}>
                    <Link href={`/finanzas/facturas/${f.id}`} className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-slate-50">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700">{f.numero}</p>
                        <p className="text-xs text-slate-400">{formatARS(f.total)}</p>
                      </div>
                      <VencimientoBadge dias={diasParaVencer(f.fecha_vencimiento)} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(documentosAlerta ?? []).length === 0 && (facturasPendientes ?? []).length === 0 && (
            <p className="text-sm text-slate-400 py-6 text-center">Sin vencimientos próximos</p>
          )}
        </div>
      </div>
    </div>
  )
}
