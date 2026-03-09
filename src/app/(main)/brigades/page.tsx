'use client'

import { Users, UserPlus, MapPin, Wrench, Phone, Mail, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/shared/lib/utils'

const BRIGADES = [
  {
    id: '1',
    name: 'Brigada Norte #1',
    supervisor: 'Miguel A. Santos',
    zone: 'Zona Norte',
    members: 6,
    activeJobs: 3,
    completedJobs: 47,
    status: 'active' as const,
    phone: '+1 (809) 555-0101',
    email: 'brigada.norte1@ayuntamiento.do',
    specialties: ['Bacheo', 'Senalizacion'],
  },
  {
    id: '2',
    name: 'Brigada Sur #2',
    supervisor: 'Jose R. Medina',
    zone: 'Zona Sur',
    members: 5,
    activeJobs: 2,
    completedJobs: 38,
    status: 'active' as const,
    phone: '+1 (809) 555-0102',
    email: 'brigada.sur2@ayuntamiento.do',
    specialties: ['Drenaje', 'Derrumbes'],
  },
  {
    id: '3',
    name: 'Brigada Este #3',
    supervisor: 'Ramon D. Perez',
    zone: 'Zona Este',
    members: 4,
    activeJobs: 1,
    completedJobs: 52,
    status: 'active' as const,
    phone: '+1 (809) 555-0103',
    email: 'brigada.este3@ayuntamiento.do',
    specialties: ['Bacheo', 'Pavimentacion'],
  },
  {
    id: '4',
    name: 'Brigada Oeste #4',
    supervisor: 'Carlos M. Reyes',
    zone: 'Zona Oeste',
    members: 5,
    activeJobs: 4,
    completedJobs: 31,
    status: 'active' as const,
    phone: '+1 (809) 555-0104',
    email: 'brigada.oeste4@ayuntamiento.do',
    specialties: ['Iluminacion', 'Senalizacion'],
  },
  {
    id: '5',
    name: 'Brigada Colonial #5',
    supervisor: 'Pedro J. Almonte',
    zone: 'Zona Colonial',
    members: 3,
    activeJobs: 0,
    completedJobs: 19,
    status: 'inactive' as const,
    phone: '+1 (809) 555-0105',
    email: 'brigada.colonial5@ayuntamiento.do',
    specialties: ['Restauracion vial'],
  },
]

const statusConfig = {
  active: { label: 'Activa', className: 'bg-green-500/15 text-green-400 border-green-500/20' },
  inactive: { label: 'Inactiva', className: 'bg-white/5 text-slate-400 border-white/10' },
}

export default function BrigadesPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A30]">Brigadas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona las brigadas de trabajo y sus asignaciones
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] hover:from-[#E55A28] hover:to-[#D97706] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6B35]/20 transition-all">
          <UserPlus className="w-4 h-4" />
          Nueva Brigada
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Brigadas', value: BRIGADES.length, color: 'text-white' },
          { label: 'Activas', value: BRIGADES.filter(b => b.status === 'active').length, color: 'text-green-400' },
          { label: 'Trabajos Activos', value: BRIGADES.reduce((a, b) => a + b.activeJobs, 0), color: 'text-blue-400' },
          { label: 'Total Miembros', value: BRIGADES.reduce((a, b) => a + b.members, 0), color: 'text-violet-400' },
        ].map((stat) => (
          <div key={stat.label} className="eng-card p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Brigade Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BRIGADES.map((brigade) => {
          const status = statusConfig[brigade.status]
          return (
            <div
              key={brigade.id}
              className="eng-card hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A90D9]/10 text-[#4A90D9]">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{brigade.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {brigade.zone}
                      </div>
                    </div>
                  </div>
                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border', status.className)}>
                    {status.label}
                  </span>
                </div>

                {/* Supervisor */}
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-slate-300">
                    {brigade.supervisor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">{brigade.supervisor}</p>
                    <p className="text-[10px] text-slate-400">Supervisor</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {brigade.specialties.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-white tabular-nums">{brigade.members}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Miembros</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-400 tabular-nums">{brigade.activeJobs}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Activos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#4A90D9] tabular-nums">{brigade.completedJobs}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Completados</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <a href={`tel:${brigade.phone}`} className="text-slate-400 hover:text-slate-300 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a href={`mailto:${brigade.email}`} className="text-slate-400 hover:text-slate-300 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
                <Link href={`/brigades/${brigade.id}`} className="flex items-center gap-1 text-xs font-medium text-[#4A90D9] hover:text-[#3A7BC8]">
                  Ver detalle <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
