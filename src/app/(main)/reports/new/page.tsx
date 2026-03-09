'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Camera,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Navigation,
  ExternalLink,
  ImagePlus,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// ─── Schema ────────────────────────────────────────────────────────────────────

const newReportSchema = z.object({
  latitude: z.number({ error: 'Ubicacion requerida' }),
  longitude: z.number({ error: 'Ubicacion requerida' }),
  address: z.string().min(5, 'Ingrese la direccion completa'),
  damage_type: z.string().min(1, 'Seleccione el tipo de dano'),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    error: 'Seleccione la severidad',
  }),
  zone: z.string().min(1, 'Seleccione la zona'),
  sector: z.string().min(1, 'Seleccione el sector'),
  title: z.string().min(5, 'El titulo debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'Describe el dano con al menos 10 caracteres'),
  street_name: z.string().min(3, 'Ingrese el nombre de la calle'),
  photo_caption: z.string().optional(),
})

type NewReportForm = z.infer<typeof newReportSchema>

// ─── Constants ─────────────────────────────────────────────────────────────────

const DAMAGE_TYPES = [
  { code: 'pothole', name: 'Bache', emoji: '🕳️' },
  { code: 'crack', name: 'Grieta', emoji: '⚡' },
  { code: 'subsidence', name: 'Hundimiento', emoji: '📉' },
  { code: 'open_manhole', name: 'Alcantarilla', emoji: '🔩' },
  { code: 'missing_sign', name: 'Senalizacion', emoji: '🚧' },
  { code: 'other', name: 'Otro', emoji: '📋' },
]

const SEVERITIES = [
  {
    value: 'low',
    label: 'Baja',
    description: 'No urgente',
    activeClass: 'border-green-500 bg-green-500/15 ring-2 ring-green-500/30',
    labelClass: 'text-green-400',
    dotClass: 'bg-green-500',
  },
  {
    value: 'medium',
    label: 'Media',
    description: 'Atencion pronto',
    activeClass: 'border-yellow-500 bg-yellow-500/15 ring-2 ring-yellow-500/30',
    labelClass: 'text-yellow-400',
    dotClass: 'bg-yellow-500',
  },
  {
    value: 'high',
    label: 'Alta',
    description: 'Urgente',
    activeClass: 'border-orange-500 bg-orange-500/15 ring-2 ring-orange-500/30',
    labelClass: 'text-orange-400',
    dotClass: 'bg-orange-500',
  },
  {
    value: 'critical',
    label: 'Critica',
    description: 'Peligro inmediato',
    activeClass: 'border-red-500 bg-red-500/15 ring-2 ring-red-500/30',
    labelClass: 'text-red-400',
    dotClass: 'bg-red-500',
  },
] as const

const ZONES_SECTORS: Record<string, string[]> = {
  'Zona Norte': ['Piantini', 'Bella Vista', 'Los Cacicazgos', 'Guaricano', 'Arroyo Hondo'],
  'Zona Sur': ['Gazcue', 'La Feria', 'Ciudad Nueva', 'Miramar'],
  'Zona Este': ['Zona Colonial', 'Villa Francisca', 'San Carlos', 'Villa Consuelo'],
  'Zona Oeste': ['Mirador Sur', 'Cristo Rey', 'Los Ríos', 'Herrera'],
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: '#D4A017' }}
      >
        {number}
      </div>
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <AlertTriangle size={12} />
      {message}
    </p>
  )
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <div className="bg-[#0F1A2E] rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-white/10">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h3 id="success-title" className="text-xl font-bold text-slate-100 mb-2">
          Reporte Enviado
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Tu reporte fue enviado exitosamente. Un supervisor lo revisara en breve.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Ver mis reportes
        </button>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

type PhotoPhase = 'before' | 'during' | 'after'

const PHOTO_PHASES: { key: PhotoPhase; label: string; description: string }[] = [
  { key: 'before', label: 'Antes', description: 'Estado actual del dano' },
  { key: 'during', label: 'Durante', description: 'Trabajo en progreso' },
  { key: 'after', label: 'Despues', description: 'Reparacion completada' },
]

export default function NewReportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedZone, setSelectedZone] = useState('')
  const [activePhotoPhase, setActivePhotoPhase] = useState<PhotoPhase>('before')
  const [photos, setPhotos] = useState<Record<PhotoPhase, string[]>>({
    before: [],
    during: [],
    after: [],
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewReportForm>({
    resolver: zodResolver(newReportSchema),
  })

  const watchedDamageType = watch('damage_type')
  const watchedSeverity = watch('severity')
  const watchedLat = watch('latitude')
  const watchedLng = watch('longitude')

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsError('Tu dispositivo no soporta GPS')
      return
    }
    setGpsLoading(true)
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', Number(pos.coords.latitude.toFixed(6)), { shouldValidate: true })
        setValue('longitude', Number(pos.coords.longitude.toFixed(6)), { shouldValidate: true })
        setGpsLoading(false)
      },
      () => {
        setGpsError('No se pudo obtener la ubicacion. Verifica los permisos del navegador.')
        setGpsLoading(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f))
    setPhotos((prev) => ({
      ...prev,
      [activePhotoPhase]: [...prev[activePhotoPhase], ...newUrls].slice(0, 10),
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(phase: PhotoPhase, index: number) {
    setPhotos((prev) => ({
      ...prev,
      [phase]: prev[phase].filter((_, i) => i !== index),
    }))
  }

  function openGoogleMaps(lat: number, lng: number) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  function openWaze(lat: number, lng: number) {
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank')
  }

  function handleZoneChange(zone: string) {
    setSelectedZone(zone)
    setValue('zone', zone, { shouldValidate: true })
    setValue('sector', '', { shouldValidate: false })
  }

  async function onSubmit(_data: NewReportForm) {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    setShowSuccess(true)
  }

  function handleSuccessClose() {
    setShowSuccess(false)
    router.push('/reports')
  }

  return (
    <>
      {showSuccess && <SuccessModal onClose={handleSuccessClose} />}

      <div className="min-h-screen bg-[#0B1A30]">
        {/* Header */}
        <div className="bg-[#0F1A2E] border-b border-white/10 px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-white">Nuevo Reporte</h1>
              <p className="text-xs text-slate-400">Reporta un dano vial</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5"
        >
          {/* Section 1: Ubicacion */}
          <section className="bg-[#0F1A2E] rounded-2xl p-5 shadow-sm border border-white/5">
            <SectionTitle number={1} title="Ubicacion" />

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium text-sm transition-colors"
            >
              {gpsLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Navigation size={18} />
              )}
              {gpsLoading ? 'Obteniendo ubicacion...' : 'Obtener mi ubicacion'}
            </button>

            {gpsError && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                {gpsError}
              </p>
            )}

            {watchedLat && watchedLng && (
              <div className="mt-3 p-3 bg-[#4A90D9]/5 border border-[#4A90D9]/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-[#4A90D9]" />
                  <span className="text-xs font-medium text-[#4A90D9]">Ubicacion capturada</span>
                </div>
                <div className="h-28 bg-[#4A90D9]/10 rounded-lg flex items-center justify-center border border-[#4A90D9]/15">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-[#4A90D9] rounded-full mx-auto mb-1 shadow-lg" />
                    <p className="text-xs font-mono text-[#0B1A30]">
                      {watchedLat.toFixed(6)}, {watchedLng.toFixed(6)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Santo Domingo, RD</p>
                  </div>
                </div>
                {/* Google Maps / Waze buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => openGoogleMaps(watchedLat, watchedLng)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0F1A2E] border border-white/10 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Google Maps
                  </button>
                  <button
                    type="button"
                    onClick={() => openWaze(watchedLat, watchedLng)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0F1A2E] border border-white/10 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Waze
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3">
              <label
                htmlFor="address"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Direccion completa
              </label>
              <input
                id="address"
                type="text"
                placeholder="Ej: Av. Winston Churchill, esq. Gustavo Mejia Ricart"
                {...register('address')}
                className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent placeholder:text-slate-500 text-slate-100"
              />
              <FieldError message={errors.address?.message} />
            </div>

            {errors.latitude && !watchedLat && (
              <FieldError message="Debes capturar tu ubicacion GPS" />
            )}
          </section>

          {/* Section 2: Clasificacion */}
          <section className="bg-[#0F1A2E] rounded-2xl p-5 shadow-sm border border-white/5">
            <SectionTitle number={2} title="Clasificacion del Dano" />

            <div>
              <p className="text-xs font-medium text-slate-300 mb-2.5">Tipo de dano</p>
              <div className="grid grid-cols-3 gap-2">
                {DAMAGE_TYPES.map((dt) => (
                  <button
                    key={dt.code}
                    type="button"
                    onClick={() => setValue('damage_type', dt.code, { shouldValidate: true })}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                      watchedDamageType === dt.code
                        ? 'border-green-500 bg-green-500/15 ring-2 ring-green-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    )}
                  >
                    <span className="text-2xl">{dt.emoji}</span>
                    <span
                      className={cn(
                        'text-xs font-medium leading-tight',
                        watchedDamageType === dt.code ? 'text-green-400' : 'text-slate-300'
                      )}
                    >
                      {dt.name}
                    </span>
                  </button>
                ))}
              </div>
              <FieldError message={errors.damage_type?.message} />
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-300 mb-2.5">Severidad</p>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITIES.map((sev) => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setValue('severity', sev.value, { shouldValidate: true })}
                    className={cn(
                      'flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left',
                      watchedSeverity === sev.value
                        ? sev.activeClass
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    )}
                  >
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full shrink-0',
                        watchedSeverity === sev.value ? sev.dotClass : 'bg-slate-300'
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          'text-xs font-semibold',
                          watchedSeverity === sev.value ? sev.labelClass : 'text-slate-200'
                        )}
                      >
                        {sev.label}
                      </p>
                      <p className="text-[10px] text-slate-400">{sev.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <FieldError message={errors.severity?.message} />
            </div>
          </section>

          {/* Section 3: Zona y Sector */}
          <section className="bg-[#0F1A2E] rounded-2xl p-5 shadow-sm border border-white/5">
            <SectionTitle number={3} title="Zona y Sector" />
            <div className="space-y-3">
              <div>
                <label htmlFor="zone" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Zona
                </label>
                <select
                  id="zone"
                  value={selectedZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent text-slate-100 cursor-pointer"
                >
                  <option value="">Selecciona la zona</option>
                  {Object.keys(ZONES_SECTORS).map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.zone?.message} />
              </div>

              <div>
                <label
                  htmlFor="sector"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Sector
                </label>
                <select
                  id="sector"
                  {...register('sector')}
                  disabled={!selectedZone}
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent text-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedZone ? 'Selecciona el sector' : 'Primero selecciona la zona'}
                  </option>
                  {selectedZone &&
                    ZONES_SECTORS[selectedZone]?.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
                <FieldError message={errors.sector?.message} />
              </div>
            </div>
          </section>

          {/* Section 4: Evidencia Fotografica (Antes / Durante / Despues) */}
          <section className="bg-[#0F1A2E] rounded-2xl p-5 shadow-sm border border-white/5">
            <SectionTitle number={4} title="Evidencia Fotografica" />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoChange}
              className="sr-only"
              aria-label="Seleccionar foto"
            />

            {/* Phase tabs */}
            <div className="flex gap-1 mb-4 bg-[#1B2B4B] rounded-xl p-1">
              {PHOTO_PHASES.map((phase) => {
                const count = photos[phase.key].length
                return (
                  <button
                    key={phase.key}
                    type="button"
                    onClick={() => setActivePhotoPhase(phase.key)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all',
                      activePhotoPhase === phase.key
                        ? 'bg-[#0F1A2E] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {phase.label}
                    {count > 0 && (
                      <span className={cn(
                        'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
                        activePhotoPhase === phase.key
                          ? 'bg-[#4A90D9] text-white'
                          : 'bg-white/20 text-white'
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Phase description */}
            <p className="text-xs text-slate-400 mb-3">
              {PHOTO_PHASES.find((p) => p.key === activePhotoPhase)?.description} — Max 10 fotos
            </p>

            {/* Photo grid */}
            {photos[activePhotoPhase].length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos[activePhotoPhase].map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${idx + 1} - ${activePhotoPhase}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(activePhotoPhase, idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Eliminar foto ${idx + 1}`}
                    >
                      <X size={12} className="text-white" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add photo button */}
            {photos[activePhotoPhase].length < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'w-full border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-all group',
                  photos[activePhotoPhase].length > 0
                    ? 'py-4 border-white/10 hover:border-[#4A90D9]/60'
                    : 'py-10 border-white/10 hover:border-[#4A90D9]/60 hover:bg-[#4A90D9]/10'
                )}
              >
                <div className={cn(
                  'rounded-full flex items-center justify-center transition-colors',
                  photos[activePhotoPhase].length > 0
                    ? 'w-10 h-10 bg-white/10 group-hover:bg-[#4A90D9]/20'
                    : 'w-14 h-14 bg-white/10 group-hover:bg-[#4A90D9]/20'
                )}>
                  {photos[activePhotoPhase].length > 0 ? (
                    <ImagePlus size={18} className="text-slate-400 group-hover:text-[#4A90D9] transition-colors" />
                  ) : (
                    <Camera size={24} className="text-slate-400 group-hover:text-[#4A90D9] transition-colors" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300 group-hover:text-[#4A90D9] transition-colors">
                    {photos[activePhotoPhase].length > 0 ? 'Agregar mas fotos' : 'Tomar Foto'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Camara o galeria — {photos[activePhotoPhase].length}/10
                  </p>
                </div>
              </button>
            )}

            {/* Summary of all phases */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {PHOTO_PHASES.map((phase) => (
                  <span key={phase.key} className="flex items-center gap-1">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      photos[phase.key].length > 0 ? 'bg-[#22C55E]' : 'bg-white/20'
                    )} />
                    {phase.label}: {photos[phase.key].length}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: Descripcion */}
          <section className="bg-[#0F1A2E] rounded-2xl p-5 shadow-sm border border-white/5">
            <SectionTitle number={5} title="Descripcion" />

            <div className="space-y-3">
              <div>
                <label htmlFor="title" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Titulo del reporte
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ej: Bache profundo en carril derecho"
                  {...register('title')}
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent placeholder:text-slate-500 text-slate-100"
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Descripcion detallada
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe el dano con el mayor detalle posible: tamano aproximado, riesgo para conductores, etc."
                  {...register('description')}
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent placeholder:text-slate-500 text-slate-100 resize-none"
                />
                <FieldError message={errors.description?.message} />
              </div>

              <div>
                <label
                  htmlFor="street_name"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Nombre de la calle
                </label>
                <input
                  id="street_name"
                  type="text"
                  placeholder="Ej: Avenida Winston Churchill"
                  {...register('street_name')}
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent placeholder:text-slate-500 text-slate-100"
                />
                <FieldError message={errors.street_name?.message} />
              </div>
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] hover:from-[#E55A28] hover:to-[#D97706] disabled:opacity-60 text-white font-semibold text-base rounded-2xl transition-all shadow-lg shadow-[#FF6B35]/20 mb-8"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            {isSubmitting ? 'Enviando reporte...' : 'Enviar Reporte'}
          </button>
        </form>
      </div>
    </>
  )
}
