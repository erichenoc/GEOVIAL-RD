'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Filter,
  LayoutList,
  Map,
  AlertCircle,
  Clock,
  User,
  Users,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { timeAgo } from '@/shared/lib/utils'
import { MOCK_REPORTS } from '@/features/reports/data/mock-reports'
import type { MockReport } from '@/features/reports/types'
import type { DamageSeverity, ReportStatus } from '@/shared/types'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ReportStatus, { label: string; dotColor: string; badgeClass: string }> = {
  draft: {
    label: 'Borrador',
    dotColor: 'bg-gray-400',
    badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  },
  submitted: {
    label: 'Enviado',
    dotColor: 'bg-blue-500',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  in_review: {
    label: 'En Revisión',
    dotColor: 'bg-yellow-500',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  },
  approved: {
    label: 'Aprobado',
    dotColor: 'bg-emerald-500',
    badgeClass: 'bg-green-500/15 text-green-400 border-green-500/20',
  },
  in_progress: {
    label: 'En Progreso',
    dotColor: 'bg-orange-500',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  },
  completed: {
    label: 'Completado',
    dotColor: 'bg-green-500',
    badgeClass: 'bg-green-500/15 text-green-400 border-green-500/20',
  },
  rejected: {
    label: 'Rechazado',
    dotColor: 'bg-red-500',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/20',
  },
  cancelled: {
    label: 'Cancelado',
    dotColor: 'bg-slate-400',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  },
}

const SEVERITY_CONFIG: Record<DamageSeverity, { label: string; badgeClass: string }> = {
  low: { label: 'Baja', badgeClass: 'bg-green-500/15 text-green-400 border-green-500/20' },
  medium: { label: 'Media', badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  high: { label: 'Alta', badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  critical: { label: 'Critica', badgeClass: 'bg-red-500/15 text-red-400 border-red-500/20' },
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'submitted', label: 'Enviado' },
  { value: 'in_review', label: 'En Revisión' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'draft', label: 'Borrador' },
]

const SEVERITY_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas las severidades' },
  { value: 'critical', label: 'Critica' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' },
]

const ZONE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas las zonas' },
  { value: 'Zona Norte', label: 'Zona Norte' },
  { value: 'Zona Sur', label: 'Zona Sur' },
  { value: 'Zona Este', label: 'Zona Este' },
  { value: 'Zona Oeste', label: 'Zona Oeste' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.badgeClass
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  )
}

function SeverityBadge({ severity }: { severity: DamageSeverity }) {
  const config = SEVERITY_CONFIG[severity]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.badgeClass
      )}
    >
      {config.label}
    </span>
  )
}

function ReportCard({ report }: { report: MockReport }) {
  return (
    <Link href={`/reports/${report.id}`} className="block group">
      <article className="bg-[#0F1A2E] border border-white/10 rounded-2xl overflow-hidden shadow-sm hover:border-[#4A90D9]/20 hover:shadow-[0_8px_32px_rgba(11,26,48,0.3)] transition-all duration-200">
        <div className="flex">
          {/* Status bar */}
          <div
            className={cn(
              'w-1 shrink-0',
              report.severity === 'critical' && 'bg-red-500',
              report.severity === 'high' && 'bg-orange-500',
              report.severity === 'medium' && 'bg-yellow-500',
              report.severity === 'low' && 'bg-green-500'
            )}
          />

          {/* Photo thumbnail */}
          <div
            className={cn(
              'hidden sm:block w-28 h-28 shrink-0 md:w-32 md:h-32 overflow-hidden bg-white/10',
              report.photo_color
            )}
          >
            <img
              src={report.photo_url}
              alt={`Foto del reporte ${report.report_number}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[#4A90D9]/60 shrink-0">
                    {report.report_number}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-[#4A90D9] transition-colors leading-snug line-clamp-1">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {report.zone_name}{' '}
                  <ChevronRight size={10} className="inline" />
                  {' '}{report.sector_name}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="shrink-0 text-slate-500 group-hover:text-slate-400 transition-colors mt-0.5"
              />
            </div>

            <p className="text-xs text-slate-400 mt-2 line-clamp-1 hidden md:block">
              {report.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-slate-400 bg-[#1B2B4B] rounded px-2 py-0.5">
                {report.damage_type.name}
              </span>
              <SeverityBadge severity={report.severity} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User size={12} />
                <span>{report.reported_by}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} />
                <span>{timeAgo(report.reported_at)}</span>
              </div>
              {report.brigade_name && (
                <div className="flex items-center gap-1.5 text-xs text-[#4A90D9]">
                  <Users size={12} />
                  <span>{report.brigade_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
        <AlertCircle size={36} className="text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">
        {hasFilters ? 'Sin resultados' : 'No hay reportes aún'}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs mb-6">
        {hasFilters
          ? 'No se encontraron reportes que coincidan con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.'
          : 'Comienza reportando el primer daño vial. Los reportes aparecerán aquí.'}
      </p>
      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="text-sm text-[#4A90D9] hover:text-[#3A7BC8] font-medium underline underline-offset-2 transition-colors"
        >
          Limpiar filtros
        </button>
      ) : (
        <Link
          href="/reports/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] hover:from-[#E55A28] hover:to-[#D97706] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-[#FF6B35]/20"
        >
          <Plus size={16} />
          Crear primer reporte
        </Link>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')

  const filteredReports = useMemo(() => {
    return MOCK_REPORTS.filter((report) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        !search ||
        report.report_number.toLowerCase().includes(searchLower) ||
        report.title.toLowerCase().includes(searchLower) ||
        report.sector_name.toLowerCase().includes(searchLower) ||
        report.damage_type.name.toLowerCase().includes(searchLower)

      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter

      const matchesSeverity =
        severityFilter === 'all' || report.severity === severityFilter

      const matchesZone =
        zoneFilter === 'all' || report.zone_name === zoneFilter

      return matchesSearch && matchesStatus && matchesSeverity && matchesZone
    })
  }, [search, statusFilter, severityFilter, zoneFilter])

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'all' ||
    severityFilter !== 'all' ||
    zoneFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setSeverityFilter('all')
    setZoneFilter('all')
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-gradient-to-r from-[#0B1A30] to-[#162F56] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Reportes de Daños</h1>
              <p className="text-sm text-white/60 mt-0.5">
                Gestiona y da seguimiento a los reportes viales
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                aria-label="Ver mapa"
              >
                <Map size={16} />
                <span className="hidden sm:inline">Ver Mapa</span>
              </Link>
              <Link
                href="/reports/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] hover:from-[#E55A28] hover:to-[#D97706] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-[#FF6B35]/20"
              >
                <Plus size={16} />
                <span>Nuevo Reporte</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0F1A2E]/90 backdrop-blur-sm border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="search"
                placeholder="Buscar por numero, titulo, sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-[#4A90D9] placeholder:text-slate-500 text-white"
                aria-label="Buscar reportes"
              />
            </div>

            {/* Filter selects */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Filter size={15} className="text-slate-500 shrink-0 hidden sm:block" />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-[#4A90D9] text-slate-200 cursor-pointer"
                aria-label="Filtrar por estado"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="flex-1 sm:flex-none text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-[#4A90D9] text-slate-200 cursor-pointer"
                aria-label="Filtrar por severidad"
              >
                {SEVERITY_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="flex-1 sm:flex-none text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-[#4A90D9] text-slate-200 cursor-pointer"
                aria-label="Filtrar por zona"
              >
                {ZONE_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="hidden sm:flex border-l border-white/10 pl-2 gap-1">
                <button
                  aria-label="Vista de lista"
                  title="Vista lista"
                  className="p-2 rounded-lg bg-white/10 text-white"
                >
                  <LayoutList size={15} />
                </button>
                <Link
                  href="/map"
                  aria-label="Vista de mapa"
                  title="Vista mapa"
                  className="p-2 rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
                >
                  <Map size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results count + clear filters */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            Mostrando{' '}
            <span className="font-semibold text-slate-200">{filteredReports.length}</span>{' '}
            {filteredReports.length === 1 ? 'reporte' : 'reportes'}
            {hasActiveFilters && ' (filtrado)'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#4A90D9] hover:text-[#3A7BC8] font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Report cards */}
        {filteredReports.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
        ) : (
          <div className="space-y-3" role="list" aria-label="Lista de reportes">
            {filteredReports.map((report) => (
              <div key={report.id} role="listitem">
                <ReportCard report={report} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
