import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DollarSign, TrendingUp, TrendingDown, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatARS } from '@/lib/utils/currency'
import { diasParaVencer, formatDate } from '@/lib/utils/dates'
import { InvoiceStatusBadge, BudgetStatusBadge } from '@/components/shared/StatusBadge'
import type { Invoice, Budget } from '@/lib/types'

export default async function FinanzasPage() {
  const supabase = await createClient()

  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [
    { data: gastosMes },
    { data: facturasPendientes },
    { data: facturasDelMes },
    { data: presupuestosActivos },
  ] = await Promise.all([
    supabase.from('expenses').select('monto').gte('fecha', primerDiaMes).eq('estado', 'aprobado'),
    supabase.from('invoices')
      .select('*, cliente:clientes(nombre)')
      .in('estado', ['emitida', 'enviada', 'vencida'])
      .order('fecha_vencimiento'),
    supabase.from('invoices').select('total, estado').gte('fecha_emision', primerDiaMes),
    supabase.from('budgets')
      .select('*, cliente:clientes(nombre)')
      .in('estado', ['borrador', 'enviado', 'aprobado'])
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalGastos = ((gastosMes ?? []) as { monto: number }[]).reduce((s, e) => s + Number(e.monto), 0)
  const totalFacturado = ((facturasDelMes ?? []) as { total: number; estado: string }[]).reduce((s, f) => s + Number(f.total), 0)
  const totalCobrado = ((facturasDelMes ?? []) as { total: number; estado: string }[]).filter(f => f.estado === 'cobrada').reduce((s, f) => s + Number(f.total), 0)
  const porCobrar = totalFacturado - totalCobrado
  const factVencidas = ((facturasPendientes ?? []) as { fecha_vencimiento: string }[]).filter(f => diasParaVencer(f.fecha_vencimiento) < 0).length

  return (
    <div>
      <PageHeader
        title="Finanzas"
        description="Control de gastos, facturación y presupuestos"
        icon={DollarSign}
        iconColor="bg-emerald-600"
        actions={
          <div className="flex gap-2">
            <Link href="/finanzas/gastos/nuevo" className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">
              + Gasto
            </Link>
            <Link href="/finanzas/facturas/nueva" className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">
              + Factura
            </Link>
            <Link href="/finanzas/presupuestos/nuevo" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
              <Plus className="w-4 h-4" />
              Presupuesto
            </Link>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Gastos del mes"
          value={formatARS(totalGastos)}
          icon={TrendingDown}
          iconColor="bg-red-100 text-red-600"
        />
        <StatCard
          title="Facturado"
          value={formatARS(totalFacturado)}
          icon={TrendingUp}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Cobrado"
          value={formatARS(totalCobrado)}
          subtitle={`${Math.round((totalCobrado / (totalFacturado || 1)) * 100)}% del facturado`}
          icon={DollarSign}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          title="Por cobrar"
          value={formatARS(porCobrar)}
          subtitle={`${factVencidas} factura${factVencidas !== 1 ? 's' : ''} vencida${factVencidas !== 1 ? 's' : ''}`}
          icon={Clock}
          iconColor="bg-orange-100 text-orange-600"
          alert={factVencidas > 0}
        />
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facturas pendientes */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Facturas pendientes</h2>
            <Link href="/finanzas/facturas" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {(facturasPendientes ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin facturas pendientes</p>
            ) : (
              (facturasPendientes as unknown as (Invoice & { cliente?: { nombre: string } })[]).slice(0, 8).map(f => (
                <div key={f.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <Link href={`/finanzas/facturas/${f.id}`} className="text-sm font-medium text-slate-800 hover:text-blue-600">
                      {f.numero}
                    </Link>
                    <p className="text-xs text-slate-400">{f.cliente?.nombre} — {formatARS(f.total)}</p>
                    <p className="text-xs text-slate-400">Vto: {formatDate(f.fecha_vencimiento)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <InvoiceStatusBadge status={f.estado} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Presupuestos activos */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Presupuestos activos</h2>
            <Link href="/finanzas/presupuestos" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {(presupuestosActivos ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin presupuestos activos</p>
            ) : (
              (presupuestosActivos as unknown as (Budget & { cliente?: { nombre: string } })[]).map(b => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <Link href={`/finanzas/presupuestos/${b.id}`} className="text-sm font-medium text-slate-800 hover:text-blue-600 line-clamp-1">
                      {b.titulo}
                    </Link>
                    <p className="text-xs text-slate-400">{b.cliente?.nombre} — {formatARS(b.total)}</p>
                  </div>
                  <BudgetStatusBadge status={b.estado} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
