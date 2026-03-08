'use client'

import { useEffect } from 'react'
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
  X,
  Shield,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useUIStore } from '@/shared/stores/ui-store'
import { useDemoStore } from '@/shared/stores/demo-store'
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

export function MobileNav() {
  const pathname = usePathname()
  const { mobileNavOpen, setMobileNav } = useUIStore()
  const { role } = useDemoStore()

  // Close on route change
  useEffect(() => {
    setMobileNav(false)
  }, [pathname, setMobileNav])

  // Lock body scroll when open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0)

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setMobileNav(false)}
        className={cn(
          'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegacion"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-900 lg:hidden',
          'transition-transform duration-300 ease-in-out',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20">
              <Shield size={16} className="text-green-400" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-wider leading-none">
                GEOVIAL
              </span>
              <span className="block text-slate-400 text-[10px] tracking-widest leading-tight mt-0.5">
                RD
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileNav(false)}
            aria-label="Cerrar menu"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="dark-scroll flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {visibleGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                {group.group}
              </p>
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
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium bg-green-500 text-white hover:bg-green-400 transition-colors"
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500 pl-[10px]'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                        )}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          <p className="px-3 text-xs text-slate-600 text-center">
            GEOVIAL RD &copy; 2025
          </p>
        </div>
      </div>
    </>
  )
}
