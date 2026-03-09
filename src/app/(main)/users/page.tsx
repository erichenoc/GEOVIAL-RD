'use client'

import { useState } from 'react'
import { UserPlus, Search, Shield, Mail, Phone, MoreVertical, Filter } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface MockUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'supervisor' | 'inspector' | 'gerente'
  status: 'active' | 'inactive'
  zone: string
  brigade: string | null
  lastActive: string
  reportsCount: number
}

const USERS: MockUser[] = [
  { id: '1', name: 'Carlos Marte', email: 'carlos.marte@ayuntamiento.do', phone: '+1 (809) 555-0001', role: 'admin', status: 'active', zone: 'Todas', brigade: null, lastActive: 'En linea', reportsCount: 0 },
  { id: '2', name: 'Ana M. Rodriguez', email: 'ana.rodriguez@ayuntamiento.do', phone: '+1 (809) 555-0002', role: 'gerente', status: 'active', zone: 'Todas', brigade: null, lastActive: 'hace 15 min', reportsCount: 0 },
  { id: '3', name: 'Miguel A. Santos', email: 'miguel.santos@ayuntamiento.do', phone: '+1 (809) 555-0003', role: 'supervisor', status: 'active', zone: 'Zona Norte', brigade: 'Brigada Norte #1', lastActive: 'hace 1 hora', reportsCount: 12 },
  { id: '4', name: 'Jose R. Medina', email: 'jose.medina@ayuntamiento.do', phone: '+1 (809) 555-0004', role: 'supervisor', status: 'active', zone: 'Zona Sur', brigade: 'Brigada Sur #2', lastActive: 'hace 30 min', reportsCount: 8 },
  { id: '5', name: 'Maria L. Castillo', email: 'maria.castillo@ayuntamiento.do', phone: '+1 (809) 555-0005', role: 'inspector', status: 'active', zone: 'Zona Norte', brigade: 'Brigada Norte #1', lastActive: 'hace 2 horas', reportsCount: 47 },
  { id: '6', name: 'Pedro Almonte', email: 'pedro.almonte@ayuntamiento.do', phone: '+1 (809) 555-0006', role: 'inspector', status: 'active', zone: 'Zona Sur', brigade: 'Brigada Sur #2', lastActive: 'hace 45 min', reportsCount: 38 },
  { id: '7', name: 'Laura P. Gomez', email: 'laura.gomez@ayuntamiento.do', phone: '+1 (809) 555-0007', role: 'inspector', status: 'active', zone: 'Zona Este', brigade: 'Brigada Este #3', lastActive: 'hace 3 horas', reportsCount: 52 },
  { id: '8', name: 'Ramon D. Perez', email: 'ramon.perez@ayuntamiento.do', phone: '+1 (809) 555-0008', role: 'supervisor', status: 'active', zone: 'Zona Este', brigade: 'Brigada Este #3', lastActive: 'Ayer', reportsCount: 5 },
  { id: '9', name: 'Carmen Diaz', email: 'carmen.diaz@ayuntamiento.do', phone: '+1 (809) 555-0009', role: 'inspector', status: 'inactive', zone: 'Zona Oeste', brigade: null, lastActive: 'hace 5 dias', reportsCount: 19 },
  { id: '10', name: 'Francisco Reyes', email: 'francisco.reyes@ayuntamiento.do', phone: '+1 (809) 555-0010', role: 'inspector', status: 'active', zone: 'Zona Colonial', brigade: 'Brigada Colonial #5', lastActive: 'hace 1 hora', reportsCount: 31 },
]

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  admin: { label: 'Administrador', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  gerente: { label: 'Gerente', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  supervisor: { label: 'Supervisor', className: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  inspector: { label: 'Inspector', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1A30]">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona el equipo de tu organizacion
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] hover:from-[#E55A28] hover:to-[#D97706] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6B35]/20 transition-all">
          <UserPlus className="w-4 h-4" />
          Invitar Usuario
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: USERS.length, color: 'text-white' },
          { label: 'Admins', value: USERS.filter(u => u.role === 'admin').length, color: 'text-rose-400' },
          { label: 'Gerentes', value: USERS.filter(u => u.role === 'gerente').length, color: 'text-amber-400' },
          { label: 'Supervisores', value: USERS.filter(u => u.role === 'supervisor').length, color: 'text-violet-400' },
          { label: 'Inspectores', value: USERS.filter(u => u.role === 'inspector').length, color: 'text-sky-400' },
        ].map((stat) => (
          <div key={stat.label} className="eng-card p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="gerente">Gerente</option>
          <option value="supervisor">Supervisor</option>
          <option value="inspector">Inspector</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="eng-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Usuario</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rol</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Zona / Brigada</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Reportes</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Estado</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Ultima Actividad</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((user) => {
                const roleBadge = ROLE_BADGES[user.role]
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B2B4B] text-xs font-bold text-slate-300 flex-shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border', roleBadge.className)}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-xs text-slate-200">{user.zone}</p>
                      {user.brigade && <p className="text-[10px] text-slate-400">{user.brigade}</p>}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-sm font-semibold text-white tabular-nums">{user.reportsCount}</span>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-1.5 h-1.5 rounded-full', user.status === 'active' ? 'bg-green-500' : 'bg-slate-500')} />
                        <span className="text-xs text-slate-300">{user.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className={cn('text-xs', user.lastActive === 'En linea' ? 'text-green-400 font-medium' : 'text-slate-400')}>
                        {user.lastActive}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-1 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  )
}
