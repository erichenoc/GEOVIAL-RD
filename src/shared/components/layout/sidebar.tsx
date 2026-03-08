'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileWarning,
  Plus,
  Users,
  MapPin,
  Map,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useUIStore } from '@/shared/stores/ui-store'
import type { UserRole } from '@/shared/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  highlight?: boolean
  roles: UserRole[]
}

interface NavGroup {
  group: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'PRINCIPAL',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard size={18} />,
        roles: ['inspector', 'supervisor', 'gerente', 'admin', 'super_admin'],
      },
      {
        label: 'Reportes',
        href: '/reports',
        icon: <FileWarning size={18} />,
        roles: ['inspector', 'supervisor', 'gerente', 'admin', 'super_admin'],
      },
      {
        label: 'Nuevo Reporte',
        href: '/reports/new',
        icon: <Plus size={18} />,
        highlight: true,
        roles: ['inspector', 'supervisor', 'admin', 'super_admin'],
      },
    ],
  },
  {
    group: 'OPERACIONES',
    items: [
      {
        label: 'Brigadas',
        href: '/brigades',
        icon: <Users size={18} />,
        roles: ['supervisor', 'gerente', 'admin', 'super_admin'],
      },
      {
        label: 'Zonas',
        href: '/zones',
        icon: <MapPin size={18} />,
        roles: ['supervisor', 'gerente', 'admin', 'super_admin'],
      },
      {
        label: 'Mapa',
        href: '/map',
        icon: <Map size={18} />,
        roles: ['inspector', 'supervisor', 'gerente', 'admin', 'super_admin'],
      },
    ],
  },
  {
    group: 'ADMINISTRACION',
    items: [
      {
        label: 'Analitica',
        href: '/analytics',
        icon: <BarChart3 size={18} />,
        roles: ['gerente', 'admin', 'super_admin'],
      },
      {
        label: 'Usuarios',
        href: '/users',
        icon: <UserCog size={18} />,
        roles: ['admin', 'super_admin'],
      },
      {
        label: 'Configuracion',
        href: '/settings',
        icon: <Settings size={18} />,
        roles: ['admin', 'super_admin'],
      },
    ],
  },
]

const ROLE_LABELS: Record<UserRole, string> = {
  inspector: 'Inspector',
  supervisor: 'Supervisor',
  gerente: 'Gerente',
  admin: 'Administrador',
  super_admin: 'Super Admin',
}

interface SidebarProps {
  role?: UserRole
  userName?: string
  orgName?: string
}

export function Sidebar({
  role = 'admin',
  userName = 'Usuario Demo',
  orgName = 'Ayuntamiento DN',
}: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-slate-800',
          sidebarCollapsed && 'justify-center px-0'
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
          <Shield size={16} className="text-green-400" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="text-white font-bold text-base tracking-wider leading-none">
              GEOVIAL
            </span>
            <span className="block text-slate-400 text-[10px] tracking-widest leading-tight mt-0.5">
              RD
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="dark-scroll flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {visibleGroups.map((group) => (
          <div key={group.group}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)

                if (item.highlight) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                          'bg-green-500 text-white hover:bg-green-400',
                          sidebarCollapsed && 'justify-center px-0 w-10 mx-auto'
                        )}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500 pl-[10px]'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
                        sidebarCollapsed && 'justify-center px-0 w-10 mx-auto border-l-0 pl-0'
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User info */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate leading-tight">
                {userName}
              </p>
              <p className="text-slate-500 text-xs truncate leading-tight mt-0.5">
                {orgName}
              </p>
            </div>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 shrink-0">
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2 py-2 border-t border-slate-800">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all duration-150',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
