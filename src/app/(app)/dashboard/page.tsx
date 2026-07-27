import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/shared/StatCard'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { formatARS } from '@/lib/utils/currency'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { CheckSquare, DollarSign, Shield, FileText, AlertTriangle, Clock, ArrowRight, TrendingUp, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { TaskStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'
import type { Task, Invoice, ClientDocument } from '@/lib/types'

const QUICK_LINKS = [
  { href: '/bpm/tareas', label: 'Operaciones', desc: 'Tareas y procesos', icon: CheckSquare, color: 'from-indigo-500 to-blue-600' },
  { href: '/finanzas/facturas', label: 'Finanzas', desc: 'Facturas y gastos', icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
  { href: '/compliance/documentos', label: 'Compliance', desc: 'Documentos legales', icon: Shield, color: 'from-amber-500 to-orange-600' },
  { href: '/clientes', label: 'Clientes', desc: 'Cartera de clientes', icon: Users, color: 'from-cyan-500 to-sky-600' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbPerfil } = await supabase.from('usuarios').select('rol, nombre').eq('id', user.id).single()
  const perfil = dbPerfil ?? { rol: (user.user_metadata?.rol as string) ?? 'admin_sismac', nombre: null }
  const nombre = (perfil as { nombre?: string | null }).nombre ?? user.email?.split('@')[0] ?? 'Usuario'
  const primerNombre = nombre.split(' ')[0]

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const fechaHoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

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
    <div className="animate-rise">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl mb-6 brand-surface px-6 sm:px-8 py-7">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
          }} />
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.20), transparent 70%)' }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[#7DD3FC] text-xs font-semibold uppercase tracking-[0.18em] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Panel de control
            </p>
            <h1 className="text-[1.7rem] sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {saludo}, {primerNombre}
            </h1>
            <p className="text-white/50 text-sm mt-1.5 capitalize">{fechaHoy}</p>
          </div>
          <Link href="/reportes"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold px-4 py-2.5 transition-colors">
            <TrendingUp className="w-4 h-4 text-[#7DD3FC]" />
            Ver reportes
          </Link>
        </div>
      </div>

      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Tareas activas"
          value={tareasActivas?.length ?? 0}
          subtitle={`${tareasVencidas?.length ?? 0} demoradas`}
          icon={CheckSquare}
          iconColor="bg-blue-50 text-blue-600 ring-blue-100"
          accent
          alert={(tareasVencidas?.length ?? 0) > 0}
        />
        <StatCard
          title="Facturas pendientes"
          value={(facturasPendientes ?? []).length}
          subtitle={`${factVencidas.length} vencidas`}
          icon={DollarSign}
          iconColor="bg-emerald-50 text-emerald-600 ring-emerald-100"
          accent
          alert={factVencidas.length > 0}
        />
        <StatCard
          title="Docs. por vencer"
          value={(documentosAlerta ?? []).length}
          subtitle={`${docVencidos.length} vencidos`}
          icon={Shield}
          iconColor="bg-amber-50 text-amber-600 ring-amber-100"
          accent
          alert={docVencidos.length > 0}
        />
        <StatCard
          title="Gastos del mes"
          value={formatARS(totalGastos)}
          subtitle={`${presupuestosActivos?.length ?? 0} presupuestos activos`}
          icon={FileText}
          iconColor="bg-violet-50 text-violet-600 ring-violet-100"
          accent
        />
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {QUICK_LINKS.map(q => (
          <Link key={q.href} href={q.href}
            className="group bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3.5 card-hover"
            style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${q.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
              <q.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{q.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{q.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas demoradas */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
              Tareas demoradas
            </h2>
            <Link href="/bpm/tareas" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {(tareasVencidas ?? []).length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                <CheckSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-400">Sin tareas demoradas. Todo al día.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {(tareasVencidas as unknown as Task[]).map((t: Task) => (
                <li key={t.id}>
                  <Link href={`/bpm/tareas/${t.id}`} className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
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
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Vencimientos
            </h2>
            <Link href="/compliance/calendario" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver calendario <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Documentos */}
          {(documentosAlerta ?? []).length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Documentos</p>
              <ul className="space-y-1">
                {(documentosAlerta as unknown as ClientDocument[]).slice(0, 5).map(d => (
                  <li key={d.id}>
                    <Link href={`/compliance/documentos/${d.id}`} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50">
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Facturas</p>
              <ul className="space-y-1">
                {(facturasPendientes as unknown as Invoice[]).slice(0, 5).map(f => (
                  <li key={f.id}>
                    <Link href={`/finanzas/facturas/${f.id}`} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50">
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
