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
  accent?: boolean
  className?: string
  onClick?: () => void
}

export function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor = 'bg-blue-50 text-blue-600 ring-blue-100',
  trend, alert, accent, className, onClick
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-hidden',
        'border border-slate-100 card-hover',
        onClick && 'cursor-pointer',
        alert ? 'border-red-200 bg-gradient-to-br from-red-50/70 to-white' : '',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {accent && !alert && (
        <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 to-cyan-400" />
      )}
      {alert && (
        <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-400" />
      )}
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-none pt-1">{title}</p>
        {Icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <p className={cn(
          'text-2xl sm:text-[1.9rem] font-bold tracking-tight leading-none break-words',
          alert ? 'text-red-600' : 'text-slate-900'
        )}>
          {value}
        </p>
        {subtitle && (
          <p className={cn('text-xs mt-2 font-medium', alert ? 'text-red-400' : 'text-slate-400')}>
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
