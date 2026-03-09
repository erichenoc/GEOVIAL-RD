'use client'

import { MapPin, Plus, Edit2, BarChart3 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const ZONES = [
  {
    id: '1',
    name: 'Zona Norte',
    description: 'Comprende los sectores al norte de la Av. John F. Kennedy',
    color: '#22C55E',
    sectors: ['Arroyo Hondo', 'Los Prados', 'Viejo Arroyo Hondo', 'La Julia'],
    totalReports: 68,
    activeReports: 12,
    completedReports: 54,
    brigades: 2,
  },
  {
    id: '2',
    name: 'Zona Sur',
    description: 'Sectores al sur incluyendo Villa Juana y Villa Consuelo',
    color: '#3B82F6',
    sectors: ['Villa Juana', 'Villa Consuelo', 'Villa Francisca', 'San Carlos'],
    totalReports: 52,
    activeReports: 8,
    completedReports: 39,
    brigades: 1,
  },
  {
    id: '3',
    name: 'Zona Este',
    description: 'Sectores orientales incluyendo Los Mina y Alma Rosa',
    color: '#F59E0B',
    sectors: ['Los Mina Norte', 'Los Mina Sur', 'Alma Rosa', 'Mendoza'],
    totalReports: 47,
    activeReports: 5,
    completedReports: 41,
    brigades: 1,
  },
  {
    id: '4',
    name: 'Zona Oeste',
    description: 'Desde la 27 de Febrero hasta la periferia oeste',
    color: '#8B5CF6',
    sectors: ['Herrera', 'Los Alcarrizos', 'Manoguayabo', 'Pantoja'],
    totalReports: 43,
    activeReports: 10,
    completedReports: 31,
    brigades: 1,
  },
  {
    id: '5',
    name: 'Zona Colonial',
    description: 'Ciudad Colonial y areas historicas protegidas',
    color: '#EF4444',
    sectors: ['Ciudad Colonial', 'San Lazaro', 'Santa Barbara', 'San Miguel'],
    totalReports: 37,
    activeReports: 3,
    completedReports: 22,
    brigades: 1,
  },
]

export default function ZonesPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A30]">Zonas y Sectores</h1>
          <p className="mt-1 text-sm text-slate-500">
            Division territorial del municipio para gestion de reportes
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] hover:from-[#E55A28] hover:to-[#D97706] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6B35]/20 transition-all">
          <Plus className="w-4 h-4" />
          Nueva Zona
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Zonas', value: ZONES.length },
          { label: 'Total Sectores', value: ZONES.reduce((a, z) => a + z.sectors.length, 0) },
          { label: 'Reportes Activos', value: ZONES.reduce((a, z) => a + z.activeReports, 0) },
          { label: 'Brigadas Asignadas', value: ZONES.reduce((a, z) => a + z.brigades, 0) },
        ].map((stat) => (
          <div key={stat.label} className="eng-card p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Zone Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ZONES.map((zone) => {
          const completionRate = Math.round((zone.completedReports / zone.totalReports) * 100)
          return (
            <div
              key={zone.id}
              className="eng-card hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Color bar */}
              <div className="h-1.5" style={{ backgroundColor: zone.color }} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${zone.color}15` }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: zone.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{zone.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{zone.sectors.length} sectores</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-[#4A90D9] hover:bg-white/5 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-4">{zone.description}</p>

                {/* Sectors */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {zone.sectors.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-white/5">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Completados</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: zone.color }}>{completionRate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1B2B4B]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%`, backgroundColor: zone.color }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-white/5">
                  <div>
                    <p className="text-lg font-bold text-white tabular-nums">{zone.totalReports}</p>
                    <p className="text-[10px] text-slate-400">Reportes</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-400 tabular-nums">{zone.activeReports}</p>
                    <p className="text-[10px] text-slate-400">Activos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white tabular-nums">{zone.brigades}</p>
                    <p className="text-[10px] text-slate-400">Brigadas</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
