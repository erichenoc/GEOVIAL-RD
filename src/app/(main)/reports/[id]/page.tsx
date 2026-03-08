'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Camera,
  Send,
  MapPin,
  Calendar,
  User,
  Users,
  Clock,
  CircleDot,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Comment {
  id: string
  initials: string
  name: string
  role: string
  roleColor: string
  date: string
  content: string
}

interface TimelineEntry {
  id: string
  label: string
  date: string
  author: string
  dotColor: string
  lineColor: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    initials: 'CM',
    name: 'Carlos Martinez',
    role: 'Inspector',
    roleColor: 'bg-blue-50 text-blue-700',
    date: '15 Feb, 09:35 AM',
    content:
      'Reporte levantado en campo. El bache mide aproximadamente 60cm de diametro y 12cm de profundidad. Riesgo moderado para motocicletas.',
  },
  {
    id: '2',
    initials: 'AR',
    name: 'Ana Rosario',
    role: 'Supervisora',
    roleColor: 'bg-indigo-50 text-indigo-700',
    date: '15 Feb, 10:20 AM',
    content:
      'Reporte revisado y aprobado. Se asigna a Brigada Alpha para intervencion esta semana. Prioridad media-alta.',
  },
  {
    id: '3',
    initials: 'MT',
    name: 'Miguel Torres',
    role: 'Brigada',
    roleColor: 'bg-green-50 text-green-700',
    date: '16 Feb, 08:15 AM',
    content:
      'Brigada Alpha en camino. Estimamos 4 horas de trabajo para reparacion completa con bacheo en frio.',
  },
]

const MOCK_TIMELINE: TimelineEntry[] = [
  {
    id: '1',
    label: 'Reportado',
    date: 'Feb 15, 09:32 - Carlos Martinez',
    author: 'Carlos Martinez',
    dotColor: 'bg-green-500',
    lineColor: 'bg-green-200',
  },
  {
    id: '2',
    label: 'En Revision',
    date: 'Feb 15, 10:15 - Ana Rosario',
    author: 'Ana Rosario',
    dotColor: 'bg-blue-500',
    lineColor: 'bg-blue-200',
  },
  {
    id: '3',
    label: 'Aprobado',
    date: 'Feb 15, 14:30 - Ana Rosario',
    author: 'Ana Rosario',
    dotColor: 'bg-indigo-500',
    lineColor: 'bg-indigo-200',
  },
  {
    id: '4',
    label: 'En Proceso',
    date: 'Feb 16, 08:00 - Miguel Torres',
    author: 'Miguel Torres',
    dotColor: 'bg-orange-500',
    lineColor: 'bg-slate-200',
  },
]

const BRIGADES = ['Brigada Alpha', 'Brigada Beta', 'Brigada Gamma', 'Brigada Delta']

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm text-slate-700 font-medium">{children}</div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [brigadeDropdownOpen, setBrigadeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [selectedBrigade, setSelectedBrigade] = useState('Brigada Alpha')

  function handleAddComment() {
    if (!comment.trim()) return
    const newComment: Comment = {
      id: String(Date.now()),
      initials: 'TU',
      name: 'Tu Nombre',
      role: 'Supervisor',
      roleColor: 'bg-indigo-50 text-indigo-700',
      date: 'Ahora',
      content: comment.trim(),
    }
    setComments((prev) => [...prev, newComment])
    setComment('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAddComment()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Back + title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                aria-label="Regresar a reportes"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-slate-900">
                    Reporte DN-00000{reportId}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    En Proceso
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Assign brigade */}
              <div className="relative">
                <button
                  onClick={() => setBrigadeDropdownOpen((p) => !p)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  <Users size={15} />
                  Asignar Brigada
                  <ChevronDown size={14} />
                </button>
                {brigadeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                    {BRIGADES.map((brigade) => (
                      <button
                        key={brigade}
                        onClick={() => {
                          setSelectedBrigade(brigade)
                          setBrigadeDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm transition-colors',
                          brigade === selectedBrigade
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        {brigade}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status change */}
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen((p) => !p)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors border border-slate-200"
                >
                  Cambiar Estado
                  <ChevronDown size={14} />
                </button>
                {statusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                    <button
                      onClick={() => setStatusDropdownOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 size={15} />
                      Marcar Completado
                    </button>
                    <button
                      onClick={() => setStatusDropdownOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle size={15} />
                      Rechazar Reporte
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Photo section */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Main photo */}
              <div className="relative h-80 lg:h-96 bg-slate-200 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Camera size={48} className="opacity-40" />
                  <p className="text-sm font-medium opacity-60">Foto principal del dano</p>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-lg font-medium">
                    Antes
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-1 p-1">
                {(['Antes', 'Durante', 'Despues'] as const).map((label) => (
                  <div
                    key={label}
                    className="relative aspect-video bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <Camera size={16} className="text-slate-400" />
                    <span className="absolute bottom-1 left-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Bache profundo en Av. 27 de Febrero
              </h2>
              <p className="text-xs text-slate-400 mb-3">Via: Av. 27 de Febrero esq. Tiradentes</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bache de aproximadamente 60cm de diametro y 12cm de profundidad ubicado en el carril
                derecho. La cavidad presenta bordes irregulares y acumulacion de agua en dias de
                lluvia. Representa un riesgo moderado para motocicletas y vehiculos de transporte
                publico que circulan por esa via frecuentemente.
              </p>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">
                Comentarios ({comments.length})
              </h2>

              <div className="space-y-4 mb-4">
                {comments.map((c) => (
                  <article key={c.id} className="flex gap-3">
                    {/* Avatar */}
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 text-slate-600 text-xs font-bold shrink-0"
                      aria-hidden="true"
                    >
                      {c.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                        <span
                          className={cn(
                            'text-[10px] font-medium px-1.5 py-0.5 rounded-md',
                            c.roleColor
                          )}
                        >
                          {c.role}
                        </span>
                        <span className="text-xs text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Add comment input */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Agregar un comentario..."
                  aria-label="Escribir comentario"
                  className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400 text-slate-800"
                />
                <button
                  onClick={handleAddComment}
                  aria-label="Enviar comentario"
                  disabled={!comment.trim()}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (Sidebar) ── */}
          <div className="space-y-4">

            {/* Info card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Informacion</h2>

              <InfoRow icon={<CircleDot size={15} />} label="Tipo de dano">
                Bache
              </InfoRow>

              <InfoRow icon={<span className="w-3.5 h-3.5 rounded-full bg-orange-500 inline-block" />} label="Severidad">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  Alta
                </span>
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Zona">
                Zona Norte
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Sector">
                Villa Mella
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Calle">
                <span className="text-xs leading-relaxed">
                  Av. 27 de Febrero esq. Tiradentes
                </span>
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Coordenadas">
                <span className="font-mono text-xs">18.4861, -69.9312</span>
              </InfoRow>

              <InfoRow icon={<User size={15} />} label="Reportado por">
                Carlos Martinez
              </InfoRow>

              <InfoRow icon={<Calendar size={15} />} label="Fecha">
                <span className="text-xs">15 Feb 2026, 09:32 AM</span>
              </InfoRow>

              <InfoRow icon={<Users size={15} />} label="Brigada">
                <span className="text-green-700">{selectedBrigade}</span>
              </InfoRow>

              <InfoRow icon={<Clock size={15} />} label="Tiempo transcurrido">
                3 dias
              </InfoRow>
            </div>

            {/* Timeline card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Linea de Tiempo</h2>

              <ol className="relative" aria-label="Historial de estado">
                {MOCK_TIMELINE.map((entry, idx) => {
                  const isLast = idx === MOCK_TIMELINE.length - 1
                  return (
                    <li key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                      {/* Dot + line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full shrink-0 mt-0.5',
                            entry.dotColor
                          )}
                        />
                        {!isLast && (
                          <div
                            className={cn('w-0.5 flex-1 mt-1', entry.lineColor)}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-1">
                        <p className="text-xs font-semibold text-slate-800">{entry.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {entry.date}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
