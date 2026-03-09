'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const demoSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email invalido'),
  municipality: z.string().min(2, 'Municipio requerido'),
  phone: z.string().min(10, 'Telefono invalido'),
})

type DemoFormData = z.infer<typeof demoSchema>

export function DemoForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
  })

  const onSubmit = async (_data: DemoFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#4A90D9]/20 bg-white/5 p-10 text-center backdrop-blur-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/20">
          <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">Solicitud Recibida</h3>
        <p className="text-slate-400">
          Nuestro equipo se pondra en contacto contigo en menos de 24 horas para coordinar tu demo personalizada.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
    >
      <h3 className="mb-6 text-xl font-bold text-white">Solicita tu Demo Gratuita</h3>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="Juan Perez"
              className={inputClass(!!errors.name)}
            />
          </Field>
          <Field label="Correo electronico" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="juan@municipio.gob.do"
              className={inputClass(!!errors.email)}
            />
          </Field>
        </div>

        <Field label="Municipio" error={errors.municipality?.message}>
          <input
            {...register('municipality')}
            placeholder="Santo Domingo Este"
            className={inputClass(!!errors.municipality)}
          />
        </Field>

        <Field label="Telefono" error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+1 (809) 000-0000"
            className={inputClass(!!errors.phone)}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#FF6B35]/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Solicitar Demo Gratuita'
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Sin compromiso. Respuesta garantizada en 24 horas.
        </p>
      </div>
    </form>
  )
}

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-200 outline-none',
    hasError
      ? 'border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/30'
      : 'border-white/10 focus:border-[#4A90D9]/50 focus:ring-1 focus:ring-[#4A90D9]/20'
  )
}
