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
  FileWarning,
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
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  submitted: {
    label: 'Enviado',
    dotColor: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  in_review: {
    label: 'En Revisión',
    dotColor: 'bg-yellow-500',
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  approved: {
    label: 'Aprobado',
    dotColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  in_progress: {
    label: 'En Progreso',
    dotColor: 'bg-orange-500',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  completed: {
    label: 'Completado',
    dotColor: 'bg-green-500',
    badgeClass: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rechazado',
    dotColor: 'bg-red-500',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  cancelled: {
    label: 'Cancelado',
    dotColor: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

const SEVERITY_CONFIG: Record<DamageSeverity, { label: string; badgeClass: string }> = {
  low: { label: 'Baja', badgeClass: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: 'Media', badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  high: { label: 'Alta', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  critical: { label: 'Critica', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
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
      <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
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
              'hidden sm:block w-28 h-28 shrink-0 md:w-32 md:h-32',
              report.photo_color
            )}
          >
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <FileWarning size={32} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    {report.report_number}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-green-700 transition-colors leading-snug line-clamp-1">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {report.zone_name}{' '}
                  <ChevronRight size={10} className="inline" />
                  {' '}{report.sector_name}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5"
              />
            </div>

            <p className="text-xs text-slate-500 mt-2 line-clamp-1 hidden md:block">
              {report.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-slate-500 bg-slate-100 rounded px-2 py-0.5">
                {report.damage_type.name}
              </span>
              <SeverityBadge severity={report.severity} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <User size={12} />
                <span>{report.reported_by}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock size={12} />
                <span>{timeAgo(report.reported_at)}</span>
              </div>
              {report.brigade_name && (
                <div className="flex items-center gap-1.5 text-xs text-green-600">
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

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <AlertCircle size={36} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {hasFilters ? 'Sin resultados' : 'No hay reportes aún'}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {hasFilters
          ? 'No se encontraron reportes que coincidan con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.'
          : 'Comienza reportando el primer daño vial. Los reportes aparecerán aquí.'}
      </p>
      {hasFilters ? (
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-green-600 hover:text-green-700 font-medium underline underline-offset-2"
        >
          Limpiar filtros
        </button>
      ) : (
        <Link
          href="/reports/new"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Reportes de Daños</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Gestiona y da seguimiento a los reportes viales
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                aria-label="Ver mapa"
              >
                <Map size={16} />
                <span className="hidden sm:inline">Ver Mapa</span>
              </Link>
              <Link
                href="/reports/new"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Plus size={16} />
                <span>Nuevo Reporte</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="search"
                placeholder="Buscar por numero, titulo, sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400 text-slate-800"
                aria-label="Buscar reportes"
              />
            </div>

            {/* Filter selects */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Filter size={15} className="text-slate-400 shrink-0 hidden sm:block" />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-700 cursor-pointer"
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
                className="flex-1 sm:flex-none text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-700 cursor-pointer"
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
                className="flex-1 sm:flex-none text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-700 cursor-pointer"
                aria-label="Filtrar por zona"
              >
                {ZONE_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="hidden sm:flex border-l border-slate-200 pl-2 gap-1">
                <button
                  aria-label="Vista de lista"
                  title="Vista lista"
                  className="p-2 rounded-lg bg-slate-100 text-slate-600"
                >
                  <LayoutList size={15} />
                </button>
                <Link
                  href="/map"
                  aria-label="Vista de mapa"
                  title="Vista mapa"
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
          <p className="text-sm text-slate-500">
            Mostrando{' '}
            <span className="font-semibold text-slate-700">{filteredReports.length}</span>{' '}
            {filteredReports.length === 1 ? 'reporte' : 'reportes'}
            {hasActiveFilters && ' (filtrado)'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Report cards */}
        {filteredReports.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
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
    </div>
  )
}
