'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/lib/types'
import {
  LayoutDashboard, CheckSquare, DollarSign, Shield,
  Users, FileText, Settings, ChevronRight, Building2,
  BarChart3, X
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
  children?: { href: string; label: string }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin_sismac', 'admin_financiero', 'supervisor_bpm', 'operario'],
  },
  {
    href: '/bpm',
    label: 'Operaciones',
    icon: CheckSquare,
    roles: ['admin_sismac', 'supervisor_bpm', 'operario'],
    children: [
      { href: '/bpm/tareas', label: 'Mis Tareas' },
      { href: '/bpm/procesos', label: 'Procesos' },
      { href: '/bpm/plantillas', label: 'Plantillas' },
    ],
  },
  {
    href: '/finanzas',
    label: 'Finanzas',
    icon: DollarSign,
    roles: ['admin_sismac', 'admin_financiero'],
    children: [
      { href: '/finanzas/gastos', label: 'Gastos' },
      { href: '/finanzas/facturas', label: 'Facturas' },
      { href: '/finanzas/presupuestos', label: 'Presupuestos' },
      { href: '/finanzas/reportes', label: 'Reportes' },
    ],
  },
  {
    href: '/compliance',
    label: 'Compliance',
    icon: Shield,
    roles: ['admin_sismac'],
    children: [
      { href: '/compliance/documentos', label: 'Documentos' },
      { href: '/compliance/calendario', label: 'Calendario' },
      { href: '/compliance/tipos', label: 'Tipos de Doc.' },
    ],
  },
  {
    href: '/clientes',
    label: 'Clientes',
    icon: Building2,
    roles: ['admin_sismac', 'admin_financiero', 'supervisor_bpm'],
  },
  {
    href: '/reportes',
    label: 'Reportes',
    icon: BarChart3,
    roles: ['admin_sismac', 'admin_financiero'],
  },
  {
    href: '/admin',
    label: 'Administración',
    icon: Settings,
    roles: ['admin_sismac'],
    children: [
      { href: '/admin/usuarios', label: 'Usuarios' },
      { href: '/audit/log', label: 'Auditoría' },
    ],
  },
]

interface SidebarProps {
  userRole: UserRole
  open: boolean
  onClose: () => void
}

export function Sidebar({ userRole, open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole))

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-slate-900 text-white transition-transform duration-200',
        'lg:relative lg:translate-x-0 lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">S</div>
            <span className="font-bold text-lg tracking-tight">SISMAC</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {visibleItems.map(item => (
              <NavItemComponent
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onClose}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">SISMAC v1.0</p>
        </div>
      </aside>
    </>
  )
}

function NavItemComponent({
  item, pathname, onNavigate
}: {
  item: NavItem
  pathname: string
  onNavigate: () => void
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  if (hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          <ChevronRight className={cn('w-3 h-3 transition-transform', isActive && 'rotate-90')} />
        </Link>
        <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-3">
          {item.children!.map(child => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center px-2 py-1.5 rounded-md text-sm transition-colors',
                  pathname === child.href
                    ? 'text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{item.label}</span>
      </Link>
    </li>
  )
}
