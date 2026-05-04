import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: { value: string; positive?: boolean }
  alert?: boolean
  className?: string
  onClick?: () => void
}

export function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor = 'bg-blue-100 text-blue-600',
  trend, alert, className, onClick
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200',
        'border border-slate-100',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        alert ? 'border-red-200 bg-gradient-to-br from-red-50 to-white' : '',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-none">{title}</p>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <p className={cn(
          'text-3xl font-bold tracking-tight leading-none',
          alert ? 'text-red-600' : 'text-slate-900'
        )}>
          {value}
        </p>
        {subtitle && (
          <p className={cn('text-xs mt-1.5 font-medium', alert ? 'text-red-400' : 'text-slate-400')}>
            {subtitle}
          </p>
        )}
      </div>
      {trend && (
        <p className={cn('text-xs font-semibold flex items-center gap-1', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
          <span>{trend.positive ? '↑' : '↓'}</span>
          {trend.value}
        </p>
      )}
    </div>
  )
}
