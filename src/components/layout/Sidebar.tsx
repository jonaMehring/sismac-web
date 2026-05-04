'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/lib/types'
import {
  LayoutDashboard, CheckSquare, DollarSign, Shield,
  Users, BarChart3, Settings, ChevronRight, Building2, X
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
  accent: string
  children?: { href: string; label: string }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    accent: 'text-sky-400',
    roles: ['admin_sismac', 'admin_financiero', 'supervisor_bpm', 'operario'],
  },
  {
    href: '/bpm',
    label: 'Operaciones',
    icon: CheckSquare,
    accent: 'text-indigo-400',
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
    accent: 'text-emerald-400',
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
    accent: 'text-amber-400',
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
    accent: 'text-cyan-400',
    roles: ['admin_sismac', 'admin_financiero', 'supervisor_bpm'],
  },
  {
    href: '/reportes',
    label: 'Reportes',
    icon: BarChart3,
    accent: 'text-purple-400',
    roles: ['admin_sismac', 'admin_financiero'],
  },
  {
    href: '/admin',
    label: 'Administración',
    icon: Settings,
    accent: 'text-slate-400',
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
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full flex flex-col transition-transform duration-300 ease-out',
        'lg:relative lg:translate-x-0 lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
        style={{ width: 260, background: 'var(--sidebar-bg)' }}
      >
        {/* Header — logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/8 shrink-0" style={{ minHeight: 68 }}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="bg-white rounded-xl p-1 shadow-md group-hover:shadow-lg transition-shadow">
              <Image
                src="/logo-sismac.png"
                alt="SISMAC"
                width={88}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2">
          <ul className="space-y-0.5">
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
        <div className="px-4 py-4 border-t border-white/8 shrink-0">
          <p className="text-xs text-white/25 text-center font-medium tracking-wide">
            SISMAC · v1.0
          </p>
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
            'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
            isActive
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:bg-white/6 hover:text-white/85'
          )}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-cyan-400" />
          )}
          <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? item.accent : 'text-white/35 group-hover:text-white/60')} />
          <span className="flex-1 leading-none">{item.label}</span>
          <ChevronRight className={cn('w-3.5 h-3.5 transition-transform duration-200 text-white/30', isActive && 'rotate-90 text-white/50')} />
        </Link>

        {isActive && (
          <ul className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5 pb-1">
            {item.children!.map(child => {
              const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all duration-100',
                      childActive
                        ? 'text-cyan-300 font-semibold bg-cyan-400/10'
                        : 'text-white/40 hover:text-white/75 hover:bg-white/5'
                    )}
                  >
                    {childActive && <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />}
                    {child.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
          isActive
            ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/15 text-white shadow-sm'
            : 'text-white/50 hover:bg-white/6 hover:text-white/85'
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-cyan-400" />
        )}
        <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? item.accent : 'text-white/35 group-hover:text-white/60')} />
        <span className="leading-none">{item.label}</span>
      </Link>
    </li>
  )
}
