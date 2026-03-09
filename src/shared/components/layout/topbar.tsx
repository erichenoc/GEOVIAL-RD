'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  ChevronRight,
  Sliders,
  FileText,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Clock,
  UserCheck,
  X,
  ArrowRight,
  LayoutDashboard,
  Plus,
  Map,
  Users,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useUIStore } from '@/shared/stores/ui-store'
import { useDemoStore } from '@/shared/stores/demo-store'
import type { UserRole } from '@/shared/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Notifications data & types
// ---------------------------------------------------------------------------

type NotificationType =
  | 'report_submitted'
  | 'status_changed'
  | 'report_completed'
  | 'comment_added'
  | 'sla_warning'
  | 'report_assigned'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'report_submitted',
    title: 'Nuevo reporte enviado',
    message: 'RPT-2024-248 — Bache critico en Av. Luperon',
    time: 'hace 5 min',
    read: false,
  },
  {
    id: '2',
    type: 'status_changed',
    title: 'Reporte en progreso',
    message: 'RPT-2024-245 — Brigada Norte #1 inicio reparacion',
    time: 'hace 23 min',
    read: false,
  },
  {
    id: '3',
    type: 'report_completed',
    title: 'Trabajo completado',
    message: 'RPT-2024-241 — Senalizacion Av. 27 de Febrero restaurada',
    time: 'hace 1 hora',
    read: false,
  },
  {
    id: '4',
    type: 'comment_added',
    title: 'Nuevo comentario',
    message: 'Ana Rodriguez comento en RPT-2024-244',
    time: 'hace 2 horas',
    read: false,
  },
  {
    id: '5',
    type: 'sla_warning',
    title: 'SLA por vencer',
    message: 'RPT-2024-239 — 4 horas restantes para resolver',
    time: 'hace 3 horas',
    read: true,
  },
  {
    id: '6',
    type: 'report_assigned',
    title: 'Reporte asignado',
    message: 'RPT-2024-247 asignado a Brigada Sur #2',
    time: 'hace 4 horas',
    read: true,
  },
]

const NOTIFICATION_ICON: Record<
  NotificationType,
  { icon: React.ElementType; className: string }
> = {
  report_submitted: { icon: FileText, className: 'text-blue-400 bg-blue-500/10' },
  status_changed: { icon: ArrowRight, className: 'text-orange-400 bg-orange-500/10' },
  report_completed: { icon: CheckCircle2, className: 'text-green-400 bg-green-500/10' },
  comment_added: { icon: MessageSquare, className: 'text-violet-400 bg-violet-500/10' },
  sla_warning: { icon: AlertTriangle, className: 'text-red-400 bg-red-500/10' },
  report_assigned: { icon: UserCheck, className: 'text-yellow-400 bg-yellow-500/10' },
}

// ---------------------------------------------------------------------------
// Search / Command Palette data & types
// ---------------------------------------------------------------------------

interface QuickAction {
  id: string
  label: string
  href: string
  icon: React.ElementType
  category: 'navigation' | 'recent'
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'dashboard', label: 'Ir al Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'navigation' },
  { id: 'new-report', label: 'Nuevo Reporte', href: '/reports/new', icon: Plus, category: 'navigation' },
  { id: 'map', label: 'Ver Mapa', href: '/map', icon: Map, category: 'navigation' },
  { id: 'brigades', label: 'Brigadas', href: '/brigades', icon: Users, category: 'navigation' },
  { id: 'rpt-247', label: 'RPT-2024-247', href: '/reports/247', icon: FileText, category: 'recent' },
  { id: 'rpt-246', label: 'RPT-2024-246', href: '/reports/246', icon: FileText, category: 'recent' },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NotificationIcon({ type }: { type: NotificationType }) {
  const { icon: Icon, className } = NOTIFICATION_ICON[type]
  return (
    <span className={cn('flex items-center justify-center w-8 h-8 rounded-lg shrink-0', className)}>
      <Icon size={15} />
    </span>
  )
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  onMarkAllRead: () => void
  onClose: () => void
}

function NotificationsDropdown({ notifications, onMarkAllRead, onClose }: NotificationsDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-[#162035] border border-white/10 rounded-xl shadow-xl shadow-black/20 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
        <button
          onClick={onMarkAllRead}
          className="text-[11px] font-medium text-[#4A90D9] hover:text-[#3a7bc8] transition-colors"
        >
          Marcar todas como leidas
        </button>
      </div>

      {/* List */}
      <ul className="max-h-[360px] overflow-y-auto divide-y divide-white/5">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 cursor-pointer',
              !n.read && 'border-l-2 border-l-[#4A90D9] bg-[#4A90D9]/5'
            )}
          >
            <NotificationIcon type={n.type} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-semibold truncate', n.read ? 'text-slate-200' : 'text-white')}>
                {n.title}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{n.message}</p>
              <p className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                <Clock size={10} />
                {n.time}
              </p>
            </div>
            {!n.read && (
              <span className="mt-1.5 w-2 h-2 rounded-full bg-[#4A90D9] shrink-0" aria-label="No leida" />
            )}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="border-t border-white/5 px-4 py-2.5">
        <button
          onClick={onClose}
          className="w-full text-xs font-medium text-[#4A90D9] hover:text-[#3a7bc8] transition-colors py-0.5"
        >
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  )
}

interface SearchPaletteProps {
  onClose: () => void
}

function SearchPalette({ onClose }: SearchPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const filtered = QUICK_ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  )

  const navActions = filtered.filter((a) => a.category === 'navigation')
  const recentActions = filtered.filter((a) => a.category === 'recent')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSelect(href: string) {
    router.push(href)
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) onClose()
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Busqueda rapida"
    >
      <div className="w-full max-w-xl bg-[#162035] rounded-xl shadow-2xl shadow-black/30 overflow-hidden border border-white/10">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar reportes, rutas, brigadas..."
            className="flex-1 text-sm text-white placeholder:text-slate-500 bg-transparent outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Cerrar busqueda"
            className="flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="py-2 max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">
              Sin resultados para &quot;{query}&quot;
            </p>
          )}

          {navActions.length > 0 && (
            <section>
              <p className="px-4 pb-1 pt-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                Acciones rapidas
              </p>
              <ul>
                {navActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <li key={action.id}>
                      <button
                        onClick={() => handleSelect(action.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 hover:text-white transition-colors text-left"
                      >
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 text-slate-400 shrink-0">
                          <Icon size={14} />
                        </span>
                        {action.label}
                        <ArrowRight size={13} className="ml-auto text-slate-600" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {recentActions.length > 0 && (
            <section>
              <p className="px-4 pb-1 pt-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                Recientes
              </p>
              <ul>
                {recentActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <li key={action.id}>
                      <button
                        onClick={() => handleSelect(action.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 hover:text-white transition-colors text-left"
                      >
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 text-slate-400 shrink-0">
                          <Icon size={14} />
                        </span>
                        {action.label}
                        <ArrowRight size={13} className="ml-auto text-slate-600" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-white/10 px-4 py-2 flex items-center gap-3 text-[11px] text-slate-500">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]">esc</kbd>
            {' '}cerrar
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]">enter</kbd>
            {' '}seleccionar
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props & Main Component
// ---------------------------------------------------------------------------

interface TopbarProps {
  userName?: string
  userEmail?: string
  orgName?: string
}

export function Topbar({
  userName = 'Usuario Demo',
  userEmail = 'demo@geovial.do',
  orgName = 'Ayuntamiento DN',
}: TopbarProps) {
  const pathname = usePathname()
  const { setMobileNav } = useUIStore()
  const { role, setRole } = useDemoStore()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [demoMenuOpen, setDemoMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const demoMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const closeSearch = useCallback(() => setSearchOpen(false), [])

  const currentDemoRole = DEMO_ROLES.find((r) => r.value === role)

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 glass-dark shrink-0">
        {/* Left: Hamburger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNav(true)}
            aria-label="Abrir menu"
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm">
              {breadcrumbs.length === 0 && (
                <li className="text-white font-semibold">Dashboard</li>
              )}
              {breadcrumbs.map((crumb, idx) => (
                <li key={crumb.href} className="flex items-center gap-1 min-w-0">
                  {idx > 0 && (
                    <ChevronRight size={14} className="text-slate-500 shrink-0" />
                  )}
                  <span
                    className={cn(
                      'truncate',
                      crumb.isLast
                        ? 'text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
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
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-dashed border-[#4A90D9]/30 hover:border-[#4A90D9]/50 hover:text-slate-200 transition-colors"
            >
              <Sliders size={12} />
              <span className="hidden md:inline">Demo:</span>
              <span className="text-slate-200">{currentDemoRole?.label}</span>
              <ChevronDown size={12} />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#162035] border border-white/10 rounded-xl shadow-xl shadow-black/20 py-1 z-50">
                <p className="px-3 py-1.5 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
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
                        ? 'text-[#4A90D9] bg-[#4A90D9]/10 font-medium'
                        : 'text-slate-200 hover:bg-white/5'
                    )}
                  >
                    {r.label}
                    {r.value === role && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4A90D9]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar (Cmd+K)"
            className="flex items-center gap-1.5 px-2 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Search size={16} />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-expanded={notifOpen}
              aria-label={`${unreadCount} notificaciones sin leer`}
              className="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <NotificationsDropdown
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          {/* User menu */}
          <div ref={userMenuRef} className="relative ml-1">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-expanded={userMenuOpen}
              aria-label="Menu de usuario"
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-[#4A90D9] to-[#D4A017] text-white border-0 text-xs font-bold">
                {initials}
              </div>
              <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#162035] border border-white/10 rounded-xl shadow-xl shadow-black/20 py-1 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{orgName}</p>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

      {/* Search / Command Palette modal — rendered outside header to escape stacking context */}
      {searchOpen && <SearchPalette onClose={closeSearch} />}
    </>
  )
}
