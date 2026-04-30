import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { BarChart3 } from 'lucide-react'
import { FinancialCharts } from '@/components/finance/FinancialCharts'

export default async function ReportesPage() {
  const supabase = await createClient()

  // Últimos 6 meses
  const meses: { label: string; desde: string; hasta: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const desde = d.toISOString().split('T')[0]
    const hasta = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
    meses.push({
      label: d.toLocaleString('es-AR', { month: 'short', year: 'numeric' }),
      desde,
      hasta,
    })
  }

  const [gastosPorMes, facturasPorMes, gastosPorCategoria] = await Promise.all([
    Promise.all(meses.map(m =>
      supabase.from('expenses').select('monto').eq('estado', 'aprobado')
        .gte('fecha', m.desde).lte('fecha', m.hasta)
        .then(({ data }: { data: { monto: number }[] | null }) => ({
          mes: m.label,
          total: (data ?? []).reduce((s: number, e) => s + Number(e.monto), 0)
        }))
    )),
    Promise.all(meses.map(m =>
      supabase.from('invoices').select('total, estado')
        .gte('fecha_emision', m.desde).lte('fecha_emision', m.hasta)
        .then(({ data }: { data: { total: number; estado: string }[] | null }) => ({
          mes: m.label,
          facturado: (data ?? []).reduce((s: number, f) => s + Number(f.total), 0),
          cobrado: (data ?? []).filter(f => f.estado === 'cobrada').reduce((s: number, f) => s + Number(f.total), 0),
        }))
    )),
    supabase.from('expenses')
      .select('monto, categoria:expense_categories(nombre, color)')
      .eq('estado', 'aprobado')
      .gte('fecha', meses[0].desde)
      .then(({ data }: { data: { monto: number; categoria?: { nombre: string; color: string } | null }[] | null }) => {
        const map: Record<string, { nombre: string; color: string; total: number }> = {}
        for (const e of data ?? []) {
          const cat = e.categoria
          const key = cat?.nombre ?? 'Sin categoría'
          if (!map[key]) map[key] = { nombre: key, color: cat?.color ?? '#94a3b8', total: 0 }
          map[key].total += Number(e.monto)
        }
        return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 8)
      }),
  ])

  const chartData = meses.map((m, i) => ({
    mes: m.label,
    gastos: gastosPorMes[i].total,
    facturado: facturasPorMes[i].facturado,
    cobrado: facturasPorMes[i].cobrado,
  }))

  return (
    <div>
      <PageHeader
        title="Reportes financieros"
        description="Análisis de gastos, facturación y cobros"
        icon={BarChart3}
        iconColor="bg-emerald-600"
      />
      <FinancialCharts data={chartData} categorias={gastosPorCategoria} />
    </div>
  )
}
