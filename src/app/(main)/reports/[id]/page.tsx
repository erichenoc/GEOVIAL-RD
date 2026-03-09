'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MOCK_REPORTS } from '@/features/reports/data/mock-reports'
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
  ZoomIn,
  ExternalLink,
  ImagePlus,
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
    roleColor: 'bg-blue-500/15 text-blue-400',
    date: '15 Feb, 09:35 AM',
    content:
      'Reporte levantado en campo. El bache mide aproximadamente 60cm de diametro y 12cm de profundidad. Riesgo moderado para motocicletas.',
  },
  {
    id: '2',
    initials: 'AR',
    name: 'Ana Rosario',
    role: 'Supervisora',
    roleColor: 'bg-indigo-500/15 text-indigo-400',
    date: '15 Feb, 10:20 AM',
    content:
      'Reporte revisado y aprobado. Se asigna a Brigada Alpha para intervencion esta semana. Prioridad media-alta.',
  },
  {
    id: '3',
    initials: 'MT',
    name: 'Miguel Torres',
    role: 'Brigada',
    roleColor: 'bg-green-500/15 text-green-400',
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
    lineColor: 'bg-green-500/30',
  },
  {
    id: '2',
    label: 'En Revision',
    date: 'Feb 15, 10:15 - Ana Rosario',
    author: 'Ana Rosario',
    dotColor: 'bg-blue-500',
    lineColor: 'bg-blue-500/30',
  },
  {
    id: '3',
    label: 'Aprobado',
    date: 'Feb 15, 14:30 - Ana Rosario',
    author: 'Ana Rosario',
    dotColor: 'bg-indigo-500',
    lineColor: 'bg-indigo-500/30',
  },
  {
    id: '4',
    label: 'En Proceso',
    date: 'Feb 16, 08:00 - Miguel Torres',
    author: 'Miguel Torres',
    dotColor: 'bg-orange-500',
    lineColor: 'bg-white/10',
  },
]

const BRIGADES = ['Brigada Alpha', 'Brigada Beta', 'Brigada Gamma', 'Brigada Delta']

type PhotoTab = 'before' | 'during' | 'after'

const PHOTO_TABS: { key: PhotoTab; label: string }[] = [
  { key: 'before', label: 'Antes' },
  { key: 'during', label: 'Durante' },
  { key: 'after', label: 'Despues' },
]

// Phase photos mapped by damage type code — each type has unique before/during/after images
const PHASE_PHOTOS: Record<string, Record<PhotoTab, { main: string; thumbs: string[] }>> = {
  pothole: {
    before: { main: '/images/reports/pothole-1.jpg', thumbs: ['/images/reports/pothole-1.jpg', '/images/reports/pothole-2.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg'] },
  },
  crack: {
    before: { main: '/images/reports/crack-1.jpg', thumbs: ['/images/reports/crack-1.jpg', '/images/reports/road-damage-1.jpg'] },
    during: { main: '/images/hero/crew-working.jpg', thumbs: ['/images/hero/crew-working.jpg', '/images/phases/during-1.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg', '/images/hero/hero-road.jpg'] },
  },
  alligator_crack: {
    before: { main: '/images/reports/crack-1.jpg', thumbs: ['/images/reports/crack-1.jpg', '/images/reports/road-damage-1.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/hero/hero-road.jpg',  thumbs: ['/images/hero/hero-road.jpg', '/images/phases/after-1.jpg'] },
  },
  open_manhole: {
    before: { main: '/images/reports/drain-1.jpg', thumbs: ['/images/reports/drain-1.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg'] },
  },
  broken_manhole: {
    before: { main: '/images/reports/drain-1.jpg', thumbs: ['/images/reports/drain-1.jpg'] },
    during: { main: '/images/hero/crew-working.jpg', thumbs: ['/images/hero/crew-working.jpg', '/images/phases/during-1.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg'] },
  },
  missing_sign: {
    before: { main: '/images/reports/signage-1.jpg', thumbs: ['/images/reports/signage-1.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg', '/images/hero/hero-road.jpg'] },
  },
  flooding: {
    before: { main: '/images/reports/flooding-1.jpg', thumbs: ['/images/reports/flooding-1.jpg'] },
    during: { main: '/images/hero/crew-working.jpg', thumbs: ['/images/hero/crew-working.jpg', '/images/phases/during-1.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg', '/images/hero/hero-road.jpg'] },
  },
  subsidence: {
    before: { main: '/images/reports/road-damage-1.jpg', thumbs: ['/images/reports/road-damage-1.jpg', '/images/reports/pothole-1.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg'] },
  },
  damaged_sidewalk: {
    before: { main: '/images/reports/sidewalk-1.jpg', thumbs: ['/images/reports/sidewalk-1.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg', '/images/hero/hero-road.jpg'] },
  },
  faded_marking: {
    before: { main: '/images/reports/marking-1.jpg', thumbs: ['/images/reports/marking-1.jpg'] },
    during: { main: '/images/hero/crew-working.jpg', thumbs: ['/images/hero/crew-working.jpg', '/images/phases/during-1.jpg'] },
    after:  { main: '/images/hero/hero-road.jpg',  thumbs: ['/images/hero/hero-road.jpg', '/images/phases/after-1.jpg'] },
  },
  street_light: {
    before: { main: '/images/reports/lighting-1.jpg', thumbs: ['/images/reports/lighting-1.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg'] },
  },
  debris: {
    before: { main: '/images/reports/road-damage-1.jpg', thumbs: ['/images/reports/road-damage-1.jpg'] },
    during: { main: '/images/hero/crew-working.jpg', thumbs: ['/images/hero/crew-working.jpg', '/images/phases/during-1.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg', '/images/hero/hero-road.jpg'] },
  },
  tree_damage: {
    before: { main: '/images/reports/road-damage-1.jpg', thumbs: ['/images/reports/road-damage-1.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/hero/hero-road.jpg',  thumbs: ['/images/hero/hero-road.jpg', '/images/phases/after-1.jpg'] },
  },
  rutting: {
    before: { main: '/images/reports/road-damage-1.jpg', thumbs: ['/images/reports/road-damage-1.jpg', '/images/reports/pothole-2.jpg'] },
    during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
    after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg'] },
  },
}

// Default fallback photos
const DEFAULT_PHOTOS: Record<PhotoTab, { main: string; thumbs: string[] }> = {
  before: { main: '/images/phases/before-1.jpg', thumbs: ['/images/phases/before-1.jpg'] },
  during: { main: '/images/phases/during-1.jpg', thumbs: ['/images/phases/during-1.jpg', '/images/hero/crew-working.jpg'] },
  after:  { main: '/images/phases/after-1.jpg',  thumbs: ['/images/phases/after-1.jpg', '/images/hero/hero-road.jpg'] },
}

function getPhotoData(damageCode: string): Record<PhotoTab, { main: string; thumbs: string[] }> {
  return PHASE_PHOTOS[damageCode] || DEFAULT_PHOTOS
}

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
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm text-slate-200 font-medium">{children}</div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  // Find the report by ID to get damage type for unique photos
  const currentReport = MOCK_REPORTS.find(r => r.id === reportId)
  const damageCode = currentReport?.damage_type?.code || 'pothole'
  const PHOTO_DATA = getPhotoData(damageCode)

  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [brigadeDropdownOpen, setBrigadeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [selectedBrigade, setSelectedBrigade] = useState('Brigada Alpha')
  const [activePhotoTab, setActivePhotoTab] = useState<PhotoTab>('before')
  const [activeThumbIndex, setActiveThumbIndex] = useState(0)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<PhotoTab, string[]>>({
    before: [],
    during: [],
    after: [],
  })

  function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f))
    setUploadedPhotos((prev) => ({
      ...prev,
      [activePhotoTab]: [...prev[activePhotoTab], ...newUrls].slice(0, 10),
    }))
    if (uploadInputRef.current) uploadInputRef.current.value = ''
  }

  function handleAddComment() {
    if (!comment.trim()) return
    const newComment: Comment = {
      id: String(Date.now()),
      initials: 'TU',
      name: 'Tu Nombre',
      role: 'Supervisor',
      roleColor: 'bg-indigo-500/15 text-indigo-400',
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
    <div className="min-h-screen bg-[#0B1A30]">
      {/* ── Header ── */}
      <div className="bg-[#0F1A2E] border-b border-white/10 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Back + title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                aria-label="Regresar a reportes"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-white">
                    Reporte DN-00000{reportId}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20">
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
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#0F1A2E] border border-white/10 rounded-xl shadow-lg py-1 z-20">
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
                            ? 'bg-blue-500/15 text-blue-400 font-medium'
                            : 'text-slate-200 hover:bg-white/5'
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
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1B2B4B] hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors border border-white/10"
                >
                  Cambiar Estado
                  <ChevronDown size={14} />
                </button>
                {statusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[#0F1A2E] border border-white/10 rounded-xl shadow-lg py-1 z-20">
                    <button
                      onClick={() => setStatusDropdownOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-sm text-green-400 hover:bg-green-500/15 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 size={15} />
                      Marcar Completado
                    </button>
                    <button
                      onClick={() => setStatusDropdownOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/15 transition-colors flex items-center gap-2"
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
            <div className="bg-[#0F1A2E] rounded-2xl border border-white/10 overflow-hidden shadow-sm">
              {/* Tab bar */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-0">
                <Camera size={15} className="text-slate-400 mr-1" />
                <span className="text-xs font-semibold text-slate-400 mr-3">Evidencia Fotografica</span>
                <div className="flex gap-1 ml-auto">
                  {PHOTO_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setActivePhotoTab(tab.key); setActiveThumbIndex(0) }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        activePhotoTab === tab.key
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-[#1B2B4B] text-slate-400 hover:bg-white/10'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main photo */}
              <div className="relative h-72 lg:h-96 mt-3 mx-4 rounded-xl overflow-hidden bg-white/10 group">
                <img
                  src={PHOTO_DATA[activePhotoTab].thumbs[activeThumbIndex]}
                  alt={`Foto ${PHOTO_TABS.find(t => t.key === activePhotoTab)?.label} del reporte`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {/* Overlay label */}
                <div className="absolute top-3 left-3">
                  <span className="bg-black/55 text-white text-xs px-2.5 py-1 rounded-lg font-semibold backdrop-blur-sm">
                    {PHOTO_TABS.find(t => t.key === activePhotoTab)?.label}
                  </span>
                </div>
                {/* Zoom hint */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1 bg-black/55 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                    <ZoomIn size={12} />
                    Foto {activeThumbIndex + 1} / {PHOTO_DATA[activePhotoTab].thumbs.length}
                  </span>
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="grid grid-cols-3 gap-2 px-4 pt-2">
                {PHOTO_DATA[activePhotoTab].thumbs.map((thumbUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveThumbIndex(idx)}
                    className={cn(
                      'relative aspect-video rounded-lg overflow-hidden transition-all duration-150',
                      activeThumbIndex === idx
                        ? 'ring-2 ring-[#4A90D9] ring-offset-1 scale-[0.98]'
                        : 'hover:opacity-90'
                    )}
                    aria-label={`Ver foto ${idx + 1}`}
                    aria-pressed={activeThumbIndex === idx}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Miniatura ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <span className="absolute bottom-1 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Uploaded photos for this phase */}
              {uploadedPhotos[activePhotoTab].length > 0 && (
                <div className="px-4 pt-2">
                  <p className="text-[10px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nuevas fotos agregadas</p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos[activePhotoTab].map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border-2 border-[#4A90D9]/30">
                        <img src={url} alt={`Nueva foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1.5 bg-[#4A90D9] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                          Nuevo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload photo button */}
              <div className="p-4 pt-2">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleUploadPhoto}
                  className="sr-only"
                  aria-label="Subir foto"
                />
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-white/10 hover:border-[#4A90D9]/50 rounded-xl text-xs font-medium text-slate-400 hover:text-[#4A90D9] transition-all"
                >
                  <ImagePlus size={14} />
                  Agregar foto — {PHOTO_TABS.find(t => t.key === activePhotoTab)?.label}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#0F1A2E] rounded-2xl border border-white/10 p-5 shadow-sm">
              <h2 className="text-base font-bold text-white mb-1">
                {currentReport?.title || 'Reporte de dano vial'}
              </h2>
              <p className="text-xs text-slate-400 mb-3">Via: {currentReport?.address || 'Direccion no disponible'}</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentReport?.description || 'Descripcion no disponible.'}
              </p>
            </div>

            {/* Comments */}
            <div className="bg-[#0F1A2E] rounded-2xl border border-white/10 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-100 mb-4">
                Comentarios ({comments.length})
              </h2>

              <div className="space-y-4 mb-4">
                {comments.map((c) => (
                  <article key={c.id} className="flex gap-3">
                    {/* Avatar */}
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-slate-300 text-xs font-bold shrink-0"
                      aria-hidden="true"
                    >
                      {c.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-slate-100">{c.name}</span>
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
                      <p className="text-sm text-slate-300 leading-relaxed">{c.content}</p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Add comment input */}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Agregar un comentario..."
                  aria-label="Escribir comentario"
                  className="flex-1 px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-500 text-slate-100"
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
            <div className="bg-[#0F1A2E] rounded-2xl border border-white/10 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-100 mb-3">Informacion</h2>

              <InfoRow icon={<CircleDot size={15} />} label="Tipo de dano">
                {currentReport?.damage_type?.name || 'Bache'}
              </InfoRow>

              <InfoRow icon={<span className="w-3.5 h-3.5 rounded-full bg-orange-500 inline-block" />} label="Severidad">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">
                  {currentReport?.severity === 'critical' ? 'Critica' : currentReport?.severity === 'high' ? 'Alta' : currentReport?.severity === 'medium' ? 'Media' : 'Baja'}
                </span>
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Zona">
                {currentReport?.zone_name || 'Zona Norte'}
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Sector">
                {currentReport?.sector_name || 'N/A'}
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Calle">
                <span className="text-xs leading-relaxed">
                  {currentReport?.address || 'Direccion no disponible'}
                </span>
              </InfoRow>

              <InfoRow icon={<MapPin size={15} />} label="Coordenadas">
                <div>
                  <span className="font-mono text-xs block mb-2">{currentReport?.latitude || 18.4861}, {currentReport?.longitude || -69.9312}</span>
                  <div className="flex gap-1.5">
                    <a
                      href={`https://www.google.com/maps?q=${currentReport?.latitude || 18.4861},${currentReport?.longitude || -69.9312}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#1B2B4B] hover:bg-white/10 rounded text-[10px] font-medium text-slate-200 transition-colors"
                    >
                      <ExternalLink size={10} />
                      Google Maps
                    </a>
                    <a
                      href={`https://www.waze.com/ul?ll=${currentReport?.latitude || 18.4861},${currentReport?.longitude || -69.9312}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#1B2B4B] hover:bg-white/10 rounded text-[10px] font-medium text-slate-200 transition-colors"
                    >
                      <ExternalLink size={10} />
                      Waze
                    </a>
                  </div>
                </div>
              </InfoRow>

              <InfoRow icon={<User size={15} />} label="Reportado por">
                {currentReport?.reported_by || 'N/A'}
              </InfoRow>

              <InfoRow icon={<Calendar size={15} />} label="Fecha">
                <span className="text-xs">{currentReport?.reported_at ? new Date(currentReport.reported_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
              </InfoRow>

              <InfoRow icon={<Users size={15} />} label="Brigada">
                <span className="text-green-400">{currentReport?.brigade_name || selectedBrigade}</span>
              </InfoRow>

              <InfoRow icon={<Clock size={15} />} label="Tiempo transcurrido">
                3 dias
              </InfoRow>
            </div>

            {/* Timeline card */}
            <div className="bg-[#0F1A2E] rounded-2xl border border-white/10 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-100 mb-4">Linea de Tiempo</h2>

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
                        <p className="text-xs font-semibold text-slate-100">{entry.label}</p>
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
