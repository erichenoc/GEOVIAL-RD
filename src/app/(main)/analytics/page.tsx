'use client'

import { useState } from 'react'
import { Clock, CheckCircle2, ShieldCheck, BarChart3, Download, FileText } from 'lucide-react'
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
  Legend,
} from 'recharts'
import { ChartCard } from '@/shared/components/charts/area-chart-card'
import { cn } from '@/shared/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type DateRange = '7d' | '1m' | '3m' | '1y'
type ZoneFilter = 'all' | 'norte' | 'sur' | 'este' | 'oeste' | 'colonial'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const trendData12m = [
  { mes: 'Abr', reportes: 29, completados: 23 },
  { mes: 'May', reportes: 34, completados: 28 },
  { mes: 'Jun', reportes: 31, completados: 25 },
  { mes: 'Jul', reportes: 40, completados: 34 },
  { mes: 'Ago', reportes: 38, completados: 30 },
  { mes: 'Sep', reportes: 44, completados: 37 },
  { mes: 'Oct', reportes: 28, completados: 19 },
  { mes: 'Nov', reportes: 35, completados: 27 },
  { mes: 'Dic', reportes: 31, completados: 24 },
  { mes: 'Ene', reportes: 42, completados: 33 },
  { mes: 'Feb', reportes: 38, completados: 29 },
  { mes: 'Mar', reportes: 47, completados: 38 },
]

const brigadeData = [
  { brigada: 'Brigada A', asignados: 52, completados: 48 },
  { brigada: 'Brigada B', asignados: 47, completados: 39 },
  { brigada: 'Brigada C', asignados: 41, completados: 37 },
  { brigada: 'Brigada D', asignados: 38, completados: 28 },
  { brigada: 'Brigada E', asignados: 29, completados: 22 },
]

const slaData = [
  { severidad: 'Critica', dentro: 18, fuera: 4 },
  { severidad: 'Alta', dentro: 45, fuera: 8 },
  { severidad: 'Media', dentro: 68, fuera: 11 },
  { severidad: 'Baja', dentro: 55, fuera: 5 },
]

const zoneReportsData = [
  { zona: 'Zona Norte', reportes: 68 },
  { zona: 'Zona Sur', reportes: 52 },
  { zona: 'Zona Este', reportes: 47 },
  { zona: 'Zona Oeste', reportes: 43 },
  { zona: 'Zona Colonial', reportes: 37 },
]

// ─── Sub-Components ──────────────────────────────────────────────────────────

interface AnalyticsKpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  trend?: string
  trendUp?: boolean
}

function AnalyticsKpiCard({ label, value, sub, icon, iconBg, trend, trendUp }: AnalyticsKpiCardProps) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2 flex-shrink-0', iconBg)}>{icon}</div>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              trendUp
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
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

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Ultimos 7 dias' },
  { value: '1m', label: 'Ultimo mes' },
  { value: '3m', label: 'Ultimos 3 meses' },
  { value: '1y', label: 'Ultimo ano' },
]

const ZONE_OPTIONS: { value: ZoneFilter; label: string }[] = [
  { value: 'all', label: 'Todas las zonas' },
  { value: 'norte', label: 'Zona Norte' },
  { value: 'sur', label: 'Zona Sur' },
  { value: 'este', label: 'Zona Este' },
  { value: 'oeste', label: 'Zona Oeste' },
  { value: 'colonial', label: 'Zona Colonial' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('3m')
  const [zone, setZone] = useState<ZoneFilter>('all')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">
              Metricas avanzadas de rendimiento operacional
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              aria-label="Exportar como PDF"
            >
              <FileText className="w-3.5 h-3.5 text-red-500" />
              PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              aria-label="Exportar como Excel"
            >
              <Download className="w-3.5 h-3.5 text-green-600" />
              Excel
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white border border-slate-100 shadow-sm px-4 py-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Filtros</span>
          <div className="flex items-center gap-2 flex-wrap">
            <div>
              <label htmlFor="dateRange" className="sr-only">Rango de fecha</label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-shadow"
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="zone" className="sr-only">Zona</label>
              <select
                id="zone"
                value={zone}
                onChange={(e) => setZone(e.target.value as ZoneFilter)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-shadow"
              >
                {ZONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 border border-green-200">
              Datos en tiempo real
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AnalyticsKpiCard
            label="Tiempo Prom. de Respuesta"
            value="4.2 hrs"
            sub="Desde envio hasta asignacion"
            iconBg="bg-blue-50"
            icon={<Clock className="w-5 h-5 text-blue-500" />}
            trend="-0.8 hrs"
            trendUp
          />
          <AnalyticsKpiCard
            label="Tasa de Completitud"
            value="87.3%"
            sub="Reportes cerrados exitosamente"
            iconBg="bg-green-50"
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
            trend="+3.2%"
            trendUp
          />
          <AnalyticsKpiCard
            label="Cumplimiento SLA"
            value="92.1%"
            sub="Dentro del tiempo acordado"
            iconBg="bg-emerald-50"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
            trend="+1.4%"
            trendUp
          />
          <AnalyticsKpiCard
            label="Reportes Este Mes"
            value="34"
            sub="Marzo 2026"
            iconBg="bg-slate-100"
            icon={<BarChart3 className="w-5 h-5 text-slate-600" />}
            trend="+6 vs mes ant."
            trendUp
          />
        </div>

        {/* Charts row 1: Trend + Brigade Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Tendencia de Reportes"
            description="Ultimos 12 meses — reportes recibidos vs completados"
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData12m} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradComp2" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="reportes"
                  name="Reportes"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#gradRep)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="completados"
                  name="Completados"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  fill="url(#gradComp2)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 px-1 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Reportes
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Completados
              </span>
            </div>
          </ChartCard>

          <ChartCard
            title="Rendimiento de Brigadas"
            description="Reportes asignados vs completados por brigada"
          >
            <ResponsiveContainer width="100%" height={268}>
              <BarChart data={brigadeData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="brigada" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="asignados" name="Asignados" fill="#BBF7D0" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="completados" name="Completados" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2: SLA + Zone Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Cumplimiento SLA por Severidad"
            description="Reportes dentro y fuera del tiempo de respuesta acordado"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={slaData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="severidad" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="dentro"
                  name="Dentro de SLA"
                  stackId="sla"
                  fill="#22C55E"
                  radius={[0, 0, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="fuera"
                  name="Fuera de SLA"
                  stackId="sla"
                  fill="#FCA5A5"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
            {/* SLA summary row */}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-50 pt-3">
              <div className="text-center">
                <p className="text-xl font-bold text-green-600 tabular-nums">92.1%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Global SLA</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-xl font-bold text-slate-800 tabular-nums">186</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Dentro</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-500 tabular-nums">28</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Fuera</p>
              </div>
            </div>
          </ChartCard>

          <ChartCard
            title="Reportes por Zona"
            description="Volumen de reportes por zona geografica"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={zoneReportsData}
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
                <Bar dataKey="reportes" name="Reportes" fill="#22C55E" radius={[0, 6, 6, 0]} barSize={18}>
                  {zoneReportsData.map((entry, i) => {
                    const opacity = 1 - i * 0.15
                    return <rect key={entry.zona} style={{ opacity }} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Max zone highlight */}
            <div className="mt-3 flex items-center gap-2 border-t border-slate-50 pt-3 px-1">
              <span className="text-[11px] text-slate-400">Zona con mayor actividad:</span>
              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                Zona Norte — 68 reportes
              </span>
            </div>
          </ChartCard>
        </div>

      </div>
    </div>
  )
}
