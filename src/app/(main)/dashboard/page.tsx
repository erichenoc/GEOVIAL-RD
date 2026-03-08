'use client'

import { FileWarning, Clock, Loader2, CheckCircle2, TrendingUp, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { ChartCard } from '@/shared/components/charts/area-chart-card'
import { cn } from '@/shared/lib/utils'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const monthlyData = [
  { mes: 'Oct', total: 28, completados: 19 },
  { mes: 'Nov', total: 35, completados: 27 },
  { mes: 'Dic', total: 31, completados: 24 },
  { mes: 'Ene', total: 42, completados: 33 },
  { mes: 'Feb', total: 38, completados: 29 },
  { mes: 'Mar', total: 47, completados: 38 },
]

const damageTypeData = [
  { tipo: 'Baches', cantidad: 74 },
  { tipo: 'Grietas', cantidad: 58 },
  { tipo: 'Derrumbe', cantidad: 41 },
  { tipo: 'Señalización', cantidad: 33 },
  { tipo: 'Drenaje', cantidad: 25 },
  { tipo: 'Iluminación', cantidad: 16 },
]

const statusPieData = [
  { name: 'Completado', value: 187, color: '#22C55E' },
  { name: 'En Proceso', value: 22, color: '#3B82F6' },
  { name: 'Pendiente', value: 38, color: '#EAB308' },
  { name: 'Rechazado', value: 12, color: '#EF4444' },
]

const recentReports = [
  {
    id: '1',
    number: 'RPT-2024-247',
    title: 'Bache profundo Av. Winston Churchill',
    zone: 'Zona Norte',
    time: 'hace 12 min',
    status: 'submitted' as const,
  },
  {
    id: '2',
    number: 'RPT-2024-246',
    title: 'Grietas en calzada Calle El Conde',
    zone: 'Zona Colonial',
    time: 'hace 45 min',
    status: 'in_progress' as const,
  },
  {
    id: '3',
    number: 'RPT-2024-245',
    title: 'Señalización deteriorada Autopista Duarte',
    zone: 'Zona Este',
    time: 'hace 1 hora',
    status: 'completed' as const,
  },
  {
    id: '4',
    number: 'RPT-2024-244',
    title: 'Drenaje obstruido Av. 27 de Febrero',
    zone: 'Zona Oeste',
    time: 'hace 2 horas',
    status: 'in_review' as const,
  },
  {
    id: '5',
    number: 'RPT-2024-243',
    title: 'Derrumbe parcial talud Carretera Mella',
    zone: 'Zona Sur',
    time: 'hace 3 horas',
    status: 'submitted' as const,
  },
]

const zonePerformanceData = [
  { zona: 'Zona Norte', total: 68, completados: 54 },
  { zona: 'Zona Sur', total: 52, completados: 39 },
  { zona: 'Zona Este', total: 47, completados: 41 },
  { zona: 'Zona Oeste', total: 43, completados: 31 },
  { zona: 'Zona Colonial', total: 37, completados: 22 },
]

// ─── Sub-Components ──────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
  change?: string
  changePositive?: boolean
}

function KpiCard({ label, value, icon, iconBg, change, changePositive }: KpiCardProps) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={cn('rounded-lg p-2.5 flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      </div>
      {change && (
        <div
          className={cn(
            'flex items-center gap-0.5 text-xs font-semibold flex-shrink-0',
            changePositive ? 'text-green-600' : 'text-red-500'
          )}
        >
          <TrendingUp className="w-3 h-3" />
          {change}
        </div>
      )}
    </div>
  )
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  submitted: { label: 'Enviado', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  in_review: { label: 'En Revisión', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  in_progress: { label: 'En Proceso', className: 'bg-orange-50 text-orange-700 border border-orange-200' },
  completed: { label: 'Completado', className: 'bg-green-50 text-green-700 border border-green-200' },
  rejected: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border border-red-200' },
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-white border border-slate-100 shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const totalDonut = statusPieData.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Resumen operacional de GEOVIAL-RD — Santo Domingo
          </p>
        </div>

        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Total Reportes"
            value={247}
            iconBg="bg-slate-100"
            icon={<FileWarning className="w-5 h-5 text-slate-600" />}
          />
          <KpiCard
            label="Pendientes"
            value={38}
            iconBg="bg-yellow-50"
            icon={<Clock className="w-5 h-5 text-yellow-500" />}
          />
          <KpiCard
            label="En Proceso"
            value={22}
            iconBg="bg-blue-50"
            icon={<Loader2 className="w-5 h-5 text-blue-500" />}
          />
          <KpiCard
            label="Completados"
            value={187}
            iconBg="bg-green-50"
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
            change="+12%"
            changePositive
          />
        </div>

        {/* Row 2: Area Chart + Horizontal Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Reportes por Mes"
            description="Ultimos 6 meses — total vs completados"
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#gradTotal)"
                  dot={{ r: 3, fill: '#22C55E', strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="completados"
                  name="Completados"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  fill="url(#gradComp)"
                  dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 px-1 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Total
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded border-dashed border-b" /> Completados
              </span>
            </div>
          </ChartCard>

          <ChartCard
            title="Por Tipo de Dano"
            description="Top 6 categorias de dano reportadas"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={damageTypeData}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 0, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="tipo"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cantidad" name="Reportes" radius={[0, 4, 4, 0]}>
                  {damageTypeData.map((_, i) => {
                    const greens = ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#DCFCE7']
                    return <Cell key={i} fill={greens[i] ?? '#22C55E'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 3: Donut + Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Reportes por Estatus"
            description="Distribucion actual del total de reportes"
          >
            <div className="relative flex justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [`${value}`, `${name}`]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #F1F5F9',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">{totalDonut}</span>
                <span className="text-xs text-slate-400 mt-0.5">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 px-2 mt-1">
              {statusPieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600 truncate">{d.name}</span>
                  <span className="ml-auto text-xs font-semibold text-slate-800 tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Reportes Recientes"
            description="Ultimas actividades registradas"
            action={
              <Link
                href="/reports"
                className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
          >
            <div className="divide-y divide-slate-50">
              {recentReports.map((report) => {
                const badge = STATUS_BADGE[report.status] ?? STATUS_BADGE.submitted
                return (
                  <div key={report.id} className="flex items-start gap-3 py-3 first:pt-1">
                    <span
                      className={cn(
                        'mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap flex-shrink-0',
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{report.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {report.number} &middot; {report.zone}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">{report.time}</span>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        </div>

        {/* Row 4: Zone Performance — full width */}
        <ChartCard
          title="Rendimiento por Zona"
          description="Reportes totales vs completados por zona geografica"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={zonePerformanceData}
              layout="vertical"
              margin={{ top: 4, right: 32, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="zona"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total" fill="#DCFCE7" radius={[0, 4, 4, 0]} barSize={14} />
              <Bar dataKey="completados" name="Completados" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 px-2 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-2.5 bg-green-100 inline-block rounded" /> Total
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-2.5 bg-green-500 inline-block rounded" /> Completados
            </span>
          </div>
        </ChartCard>

      </div>
    </div>
  )
}
