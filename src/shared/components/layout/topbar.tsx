'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  ChevronRight,
  Sliders,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useUIStore } from '@/shared/stores/ui-store'
import { useDemoStore } from '@/shared/stores/demo-store'
import type { UserRole } from '@/shared/types'

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  reports: 'Reportes',
  new: 'Nuevo Reporte',
  brigades: 'Brigadas',
  zones: 'Zonas',
  map: 'Mapa',
  analytics: 'Analitica',
  users: 'Usuarios',
  settings: 'Configuracion',
}

const DEMO_ROLES: { value: UserRole; label: string }[] = [
  { value: 'inspector', label: 'Inspector' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'admin', label: 'Administrador' },
]

interface TopbarProps {
  userName?: string
  userEmail?: string
  orgName?: string
  notificationCount?: number
}

export function Topbar({
  userName = 'Usuario Demo',
  userEmail = 'demo@geovial.do',
  orgName = 'Ayuntamiento DN',
  notificationCount = 4,
}: TopbarProps) {
  const pathname = usePathname()
  const { setMobileNav } = useUIStore()
  const { role, setRole } = useDemoStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [demoMenuOpen, setDemoMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const demoMenuRef = useRef<HTMLDivElement>(null)

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  // Breadcrumb from pathname
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((seg, idx) => ({
    label: BREADCRUMB_LABELS[seg] ?? seg,
    href: '/' + segments.slice(0, idx + 1).join('/'),
    isLast: idx === segments.length - 1,
  }))

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target as Node)) {
        setDemoMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentDemoRole = DEMO_ROLES.find((r) => r.value === role)

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shrink-0">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileNav(true)}
          aria-label="Abrir menu"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm">
            {breadcrumbs.length === 0 && (
              <li className="text-slate-900 font-semibold">Dashboard</li>
            )}
            {breadcrumbs.map((crumb, idx) => (
              <li key={crumb.href} className="flex items-center gap-1 min-w-0">
                {idx > 0 && (
                  <ChevronRight size={14} className="text-slate-400 shrink-0" />
                )}
                <span
                  className={cn(
                    'truncate',
                    crumb.isLast
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {crumb.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Demo role switcher */}
        <div ref={demoMenuRef} className="relative">
          <button
            onClick={() => setDemoMenuOpen((prev) => !prev)}
            aria-expanded={demoMenuOpen}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-700 transition-colors"
          >
            <Sliders size={12} />
            <span className="hidden md:inline">Demo:</span>
            <span className="text-slate-700">{currentDemoRole?.label}</span>
            <ChevronDown size={12} />
          </button>

          {demoMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <p className="px-3 py-1.5 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                Cambiar Rol
              </p>
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setRole(r.value)
                    setDemoMenuOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                    r.value === role
                      ? 'text-green-600 bg-green-50 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {r.label}
                  {r.value === role && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <button
          aria-label="Buscar"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Search size={16} />
        </button>

        {/* Notifications */}
        <button
          aria-label={`${notificationCount} notificaciones`}
          className="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Bell size={16} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div ref={userMenuRef} className="relative ml-1">
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-label="Menu de usuario"
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 text-green-600 text-xs font-bold">
              {initials}
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{orgName}</p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Cerrar Sesion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
