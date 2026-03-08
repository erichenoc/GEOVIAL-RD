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
    activeClass: 'border-green-500 bg-green-50 ring-2 ring-green-300',
    labelClass: 'text-green-700',
    dotClass: 'bg-green-500',
  },
  {
    value: 'medium',
    label: 'Media',
    description: 'Atencion pronto',
    activeClass: 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-300',
    labelClass: 'text-yellow-700',
    dotClass: 'bg-yellow-500',
  },
  {
    value: 'high',
    label: 'Alta',
    description: 'Urgente',
    activeClass: 'border-orange-500 bg-orange-50 ring-2 ring-orange-300',
    labelClass: 'text-orange-700',
    dotClass: 'bg-orange-500',
  },
  {
    value: 'critical',
    label: 'Critica',
    description: 'Peligro inmediato',
    activeClass: 'border-red-500 bg-red-50 ring-2 ring-red-300',
    labelClass: 'text-red-700',
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
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold shrink-0">
        {number}
      </div>
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
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
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 id="success-title" className="text-xl font-bold text-slate-800 mb-2">
          Reporte Enviado
        </h3>
        <p className="text-slate-500 text-sm mb-6">
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

export default function NewReportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedZone, setSelectedZone] = useState('')

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
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
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

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">Nuevo Reporte</h1>
              <p className="text-xs text-slate-500">Reporta un dano vial</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5"
        >
          {/* Section 1: Ubicacion */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <SectionTitle number={1} title="Ubicacion" />

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-medium text-sm transition-colors"
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
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-green-600" />
                  <span className="text-xs font-medium text-green-700">Ubicacion capturada</span>
                </div>
                <div className="h-28 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 shadow-lg" />
                    <p className="text-xs font-mono text-green-700">
                      {watchedLat.toFixed(4)}, {watchedLng.toFixed(4)}
                    </p>
                    <p className="text-[10px] text-green-500 mt-0.5">Santo Domingo, RD</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3">
              <label
                htmlFor="address"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Direccion completa
              </label>
              <input
                id="address"
                type="text"
                placeholder="Ej: Av. Winston Churchill, esq. Gustavo Mejia Ricart"
                {...register('address')}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400 text-slate-800"
              />
              <FieldError message={errors.address?.message} />
            </div>

            {errors.latitude && !watchedLat && (
              <FieldError message="Debes capturar tu ubicacion GPS" />
            )}
          </section>

          {/* Section 2: Clasificacion */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <SectionTitle number={2} title="Clasificacion del Dano" />

            <div>
              <p className="text-xs font-medium text-slate-600 mb-2.5">Tipo de dano</p>
              <div className="grid grid-cols-3 gap-2">
                {DAMAGE_TYPES.map((dt) => (
                  <button
                    key={dt.code}
                    type="button"
                    onClick={() => setValue('damage_type', dt.code, { shouldValidate: true })}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                      watchedDamageType === dt.code
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span className="text-2xl">{dt.emoji}</span>
                    <span
                      className={cn(
                        'text-xs font-medium leading-tight',
                        watchedDamageType === dt.code ? 'text-green-700' : 'text-slate-600'
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
              <p className="text-xs font-medium text-slate-600 mb-2.5">Severidad</p>
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
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
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
                          watchedSeverity === sev.value ? sev.labelClass : 'text-slate-700'
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
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <SectionTitle number={3} title="Zona y Sector" />
            <div className="space-y-3">
              <div>
                <label htmlFor="zone" className="block text-xs font-medium text-slate-600 mb-1.5">
                  Zona
                </label>
                <select
                  id="zone"
                  value={selectedZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-800 cursor-pointer"
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
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  Sector
                </label>
                <select
                  id="sector"
                  {...register('sector')}
                  disabled={!selectedZone}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Section 4: Foto */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <SectionTitle number={4} title="Foto del Dano" />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="sr-only"
              aria-label="Seleccionar foto"
            />

            {photoPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Vista previa de la foto"
                  className="w-full h-52 object-cover rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                  aria-label="Eliminar foto"
                >
                  <X size={14} className="text-slate-600" />
                </button>
                <div className="mt-3">
                  <label
                    htmlFor="photo_caption"
                    className="block text-xs font-medium text-slate-600 mb-1.5"
                  >
                    Descripcion de la foto (opcional)
                  </label>
                  <input
                    id="photo_caption"
                    type="text"
                    placeholder="Ej: Vista frontal del bache"
                    {...register('photo_caption')}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-10 flex flex-col items-center gap-3 hover:border-green-400 hover:bg-green-50/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                  <Camera size={24} className="text-slate-400 group-hover:text-green-600 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600 group-hover:text-green-700 transition-colors">
                    Tomar Foto
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Toca para abrir la camara o galeria
                  </p>
                </div>
              </button>
            )}
          </section>

          {/* Section 5: Descripcion */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <SectionTitle number={5} title="Descripcion" />

            <div className="space-y-3">
              <div>
                <label htmlFor="title" className="block text-xs font-medium text-slate-600 mb-1.5">
                  Titulo del reporte
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ej: Bache profundo en carril derecho"
                  {...register('title')}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400 text-slate-800"
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  Descripcion detallada
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe el dano con el mayor detalle posible: tamano aproximado, riesgo para conductores, etc."
                  {...register('description')}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 resize-none"
                />
                <FieldError message={errors.description?.message} />
              </div>

              <div>
                <label
                  htmlFor="street_name"
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  Nombre de la calle
                </label>
                <input
                  id="street_name"
                  type="text"
                  placeholder="Ej: Avenida Winston Churchill"
                  {...register('street_name')}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400 text-slate-800"
                />
                <FieldError message={errors.street_name?.message} />
              </div>
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-base rounded-2xl transition-colors shadow-lg shadow-green-200 mb-8"
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
