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
        'bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        alert && 'border-red-200 bg-red-50/30',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon && (
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className={cn('text-2xl font-bold', alert ? 'text-red-700' : 'text-slate-900')}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {trend && (
        <p className={cn('text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-500')}>
          {trend.value}
        </p>
      )}
    </div>
  )
}
