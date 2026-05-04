'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Info, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AlertItem {
  id: string
  message: string
  href?: string
  severity: 'critical' | 'warning' | 'info'
}

interface AlertBannerProps {
  alerts: AlertItem[]
  className?: string
}

const SEVERITY = {
  critical: {
    wrapper: 'bg-red-50 border-red-200/60',
    icon: 'text-red-500',
    text: 'text-red-800',
    link: 'text-red-600 hover:text-red-800',
    bar: 'bg-red-500',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200/60',
    icon: 'text-amber-500',
    text: 'text-amber-800',
    link: 'text-amber-600 hover:text-amber-800',
    bar: 'bg-amber-400',
  },
  info: {
    wrapper: 'bg-blue-50 border-blue-200/60',
    icon: 'text-blue-500',
    text: 'text-blue-800',
    link: 'text-blue-600 hover:text-blue-800',
    bar: 'bg-blue-500',
  },
}

export function AlertBanner({ alerts, className }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div className={cn('space-y-2 mb-6', className)}>
      {visible.map(alert => {
        const s = SEVERITY[alert.severity]
        const Icon = alert.severity === 'info' ? Info : AlertTriangle
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-center gap-3 pl-0 pr-4 py-3 rounded-2xl border text-sm font-medium overflow-hidden',
              s.wrapper
            )}
          >
            <div className={cn('w-1 self-stretch rounded-l-full shrink-0', s.bar)} />
            <Icon className={cn('w-4 h-4 shrink-0', s.icon)} />
            <span className={cn('flex-1 font-medium', s.text)}>{alert.message}</span>
            {alert.href && (
              <Link
                href={alert.href}
                className={cn('flex items-center gap-1 text-xs font-semibold shrink-0 transition-colors', s.link)}
              >
                Ver <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <button
              onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
