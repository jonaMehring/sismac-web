'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, PieChart, Pie
} from 'recharts'
import { formatARS } from '@/lib/utils/currency'

interface MonthData {
  mes: string
  gastos: number
  facturado: number
  cobrado: number
}

interface CatData {
  nombre: string
  color: string
  total: number
}

interface Props {
  data: MonthData[]
  categorias: CatData[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTooltipValue = (value: any) => formatARS(Number(value) || 0)

export function FinancialCharts({ data, categorias }: Props) {
  const totalGastos6m = data.reduce((s, d) => s + d.gastos, 0)
  const totalFacturado6m = data.reduce((s, d) => s + d.facturado, 0)
  const totalCobrado6m = data.reduce((s, d) => s + d.cobrado, 0)

  return (
    <div className="space-y-6">
      {/* KPIs resumen */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Gastos (6 meses)', value: totalGastos6m, color: 'text-red-600' },
          { label: 'Facturado (6 meses)', value: totalFacturado6m, color: 'text-blue-600' },
          { label: 'Cobrado (6 meses)', value: totalCobrado6m, color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-400 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{formatARS(k.value)}</p>
          </div>
        ))}
      </div>

      {/* Gráfico principal */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-6">Gastos vs Facturación — últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip
              formatter={formatTooltipValue}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="gastos" name="Gastos" fill="#fca5a5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="facturado" name="Facturado" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            <Line dataKey="cobrado" name="Cobrado" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gastos por categoría */}
      {categorias.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-6">Gastos por categoría (6 meses)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categorias}
                  dataKey="total"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categorias.map((cat, i) => (
                    <Cell key={i} fill={cat.color} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltipValue} contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Detalle por categoría</h2>
            <ul className="space-y-2">
              {categorias.map(cat => (
                <li key={cat.nombre} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="flex-1 text-sm text-slate-600 truncate">{cat.nombre}</span>
                  <span className="text-sm font-semibold text-slate-800">{formatARS(cat.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
