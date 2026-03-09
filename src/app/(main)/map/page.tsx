'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Filter, Layers, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// Dynamically import Leaflet map (SSR-incompatible)
const ReportMap = dynamic(
  () => import('@/features/reports/components/report-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#1B2B4B] animate-pulse flex items-center justify-center">
        <p className="text-slate-400 text-sm font-medium">Cargando mapa...</p>
      </div>
    ),
  }
)

// ─── Filter config ────────────────────────────────────────────────────────────

const SEVERITY_FILTERS = [
  { value: 'all', label: 'Todas', dot: 'bg-slate-400' },
  { value: 'critical', label: 'Critica', dot: 'bg-red-500' },
  { value: 'high', label: 'Alta', dot: 'bg-orange-500' },
  { value: 'medium', label: 'Media', dot: 'bg-yellow-500' },
  { value: 'low', label: 'Baja', dot: 'bg-green-500' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'submitted', label: 'Enviado' },
  { value: 'in_review', label: 'En Revision' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'completed', label: 'Completado' },
]

const LEGEND = [
  { color: '#ef4444', label: 'Critica' },
  { color: '#f97316', label: 'Alta' },
  { color: '#eab308', label: 'Media' },
  { color: '#22c55e', label: 'Baja' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [legendOpen, setLegendOpen] = useState(true)

  return (
    <div className="relative w-full -m-6" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Map (full area) ── */}
      <div className="absolute inset-0">
        <ReportMap />
      </div>

      {/* ── Filter panel overlay (top-left) ── */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">

        {/* Filter toggle button */}
        <button
          onClick={() => setFilterOpen((p) => !p)}
          aria-expanded={filterOpen}
          aria-label="Filtros del mapa"
          className="flex items-center gap-2 px-3 py-2 bg-[#0F1A2E] rounded-xl shadow-lg shadow-black/10 border border-white/10 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
        >
          <Filter size={15} />
          Filtros
          <ChevronDown
            size={14}
            className={cn(
              'transition-transform text-slate-400',
              filterOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Filter panel */}
        {filterOpen && (
          <div className="bg-[#0F1A2E] rounded-xl shadow-lg shadow-black/10 border border-white/10 p-3 w-56 space-y-3">
            {/* Severity filter */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Severidad
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SEVERITY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSeverityFilter(f.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border transition-all',
                      severityFilter === f.value
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/10'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full', f.dot)} />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Estado
              </p>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent text-slate-300 cursor-pointer"
                aria-label="Filtrar por estado"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters indicator */}
            {(severityFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSeverityFilter('all')
                  setStatusFilter('all')
                }}
                className="w-full text-xs text-[#4A90D9] hover:text-[#3A7BC8] font-medium text-center"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Legend overlay (bottom-left) ── */}
      <div className="absolute bottom-6 left-3 z-10">
        <div className="bg-[#0F1A2E] rounded-xl shadow-lg shadow-black/10 border border-white/10 overflow-hidden">
          <button
            onClick={() => setLegendOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 w-full text-left text-xs font-semibold text-slate-200 hover:bg-white/5 transition-colors"
            aria-expanded={legendOpen}
          >
            <Layers size={13} />
            Leyenda
            <ChevronDown
              size={12}
              className={cn(
                'ml-auto transition-transform text-slate-400',
                legendOpen && 'rotate-180'
              )}
            />
          </button>
          {legendOpen && (
            <div className="px-3 pb-2.5 space-y-1.5">
              {LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white/10 shadow-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Report count badge (top-right) ── */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-[#0F1A2E] rounded-xl shadow-lg shadow-black/10 border border-white/10 px-3 py-2">
          <p className="text-[10px] text-slate-400 font-medium">Reportes activos</p>
          <p className="text-xl font-bold text-white">15</p>
        </div>
      </div>
    </div>
  )
}
