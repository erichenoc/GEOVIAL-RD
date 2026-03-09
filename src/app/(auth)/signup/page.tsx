'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { useState, Suspense } from 'react'
import { cn } from '@/shared/lib/utils'

const signupSchema = z
  .object({
    token: z.string().min(6, 'El codigo de invitacion es requerido'),
    firstName: z.string().min(2, 'Nombre requerido'),
    lastName: z.string().min(2, 'Apellido requerido'),
    email: z.string().email('Email invalido'),
    password: z
      .string()
      .min(8, 'Minimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una mayuscula')
      .regex(/[0-9]/, 'Debe incluir al menos un numero'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token') ?? ''

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { token: inviteToken },
  })

  const onSubmit = async (_data: SignupFormData) => {
    setSubmitError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      router.push('/dashboard')
    } catch {
      setSubmitError('Ocurrio un error al crear tu cuenta. Verifica el codigo de invitacion.')
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017]/15">
          <KeyRound className="h-5 w-5 text-[#D4A017]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Registro por Invitacion</h1>
        <p className="mt-2 text-sm text-slate-400">
          Crea tu cuenta usando el codigo de invitacion proporcionado por tu municipio.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Token */}
        <FormField label="Codigo de invitacion" error={errors.token?.message}>
          <input
            {...register('token')}
            placeholder="XXXX-XXXX-XXXX"
            className={cn(inputClass(!!errors.token), 'font-mono tracking-widest uppercase')}
          />
        </FormField>

        {/* Name row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" error={errors.firstName?.message}>
            <input
              {...register('firstName')}
              placeholder="Juan"
              autoComplete="given-name"
              className={inputClass(!!errors.firstName)}
            />
          </FormField>
          <FormField label="Apellido" error={errors.lastName?.message}>
            <input
              {...register('lastName')}
              placeholder="Perez"
              autoComplete="family-name"
              className={inputClass(!!errors.lastName)}
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField label="Correo electronico" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="juan@municipio.gob.do"
            className={inputClass(!!errors.email)}
          />
        </FormField>

        {/* Password */}
        <FormField label="Contrasena" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(inputClass(!!errors.password), 'pr-11')}
            />
            <TogglePasswordButton
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
          </div>
          {!errors.password && (
            <p className="mt-1 text-xs text-slate-600">
              Min. 8 caracteres, una mayuscula y un numero.
            </p>
          )}
        </FormField>

        {/* Confirm Password */}
        <FormField label="Confirmar contrasena" error={errors.confirmPassword?.message}>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(inputClass(!!errors.confirmPassword), 'pr-11')}
            />
            <TogglePasswordButton
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
            />
          </div>
        </FormField>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-[#F59E0B]/25 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="font-medium text-[#D4A017] transition-colors hover:text-[#B8890F]"
        >
          Iniciar sesion
        </Link>
      </p>
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/5" />}>
      <SignupForm />
    </Suspense>
  )
}

// Sub-components

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

interface TogglePasswordButtonProps {
  show: boolean
  onToggle: () => void
}

function TogglePasswordButton({ show, onToggle }: TogglePasswordButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
      aria-label={show ? 'Ocultar contrasena' : 'Mostrar contrasena'}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 backdrop-blur-sm transition-all duration-200 outline-none',
    hasError
      ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
      : 'border-white/10 focus:border-[#4A90D9]/50 focus:ring-2 focus:ring-[#4A90D9]/15 hover:border-white/20'
  )
}
