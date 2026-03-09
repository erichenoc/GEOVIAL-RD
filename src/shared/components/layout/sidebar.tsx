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
        'hidden lg:flex flex-col bg-gradient-to-b from-[#0B1A30] via-[#0F2341] to-[#162F56] border-r border-white/5 transition-all duration-300 ease-in-out shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-white/5',
          sidebarCollapsed && 'justify-center px-0'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4A90D9] to-[#D4A017] shrink-0',
            'shadow-[0_0_12px_rgba(212,160,23,0.45)]'
          )}
        >
          <Shield size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-white font-bold text-base tracking-wider">
                GEOVIAL
              </span>
              <span className="text-[#D4A017] font-bold text-base tracking-wider">
                RD
              </span>
            </div>
            <span className="block text-[#4A90D9]/60 text-[9px] tracking-[0.2em] leading-tight mt-0.5 uppercase">
              Infraestructura Inteligente
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="dark-scroll flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {visibleGroups.map((group) => (
          <div key={group.group}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.18em] text-[#4A90D9]/50 uppercase">
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
                          'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-white hover:opacity-90 shadow-[0_2px_8px_rgba(255,107,53,0.35)]',
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
                        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[#4A90D9]/10 text-[#4A90D9]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5',
                        sidebarCollapsed && 'justify-center px-0 w-10 mx-auto'
                      )}
                    >
                      {/* Active left-border gradient indicator */}
                      {isActive && !sidebarCollapsed && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-[#D4A017] to-[#F59E0B]"
                          style={{ boxShadow: '0 0 6px rgba(212, 160, 23, 0.35)' }}
                        />
                      )}
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
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#4A90D9] to-[#D4A017] text-white text-xs font-bold shrink-0">
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
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#D4A017]/10 text-[#D4A017] shrink-0">
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2 py-2 border-t border-white/5">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-150',
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
