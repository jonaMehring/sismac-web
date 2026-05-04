import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon: Icon, iconColor = 'bg-blue-600', actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-slate-400 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
