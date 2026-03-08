'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Ingresa un email valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (_data: LoginFormData) => {
    setAuthError(null)
    try {
      // Demo: simulate auth delay then redirect
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard')
    } catch {
      setAuthError('Credenciales incorrectas. Verifica tu email y contrasena.')
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Iniciar Sesion</h1>
        <p className="mt-2 text-sm text-slate-400">
          Bienvenido de vuelta. Accede a tu panel municipal.
        </p>
      </div>

      {authError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@municipio.gob.do"
            {...register('email')}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Contrasena
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-green-400 transition-colors hover:text-green-300"
            >
              Olvidaste tu contrasena?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={cn(inputClass(!!errors.password), 'pr-11')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Iniciando sesion...
            </>
          ) : (
            'Iniciar Sesion'
          )}
        </button>
      </form>

      {/* Demo hint */}
      <div className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-400">Demo:</span> Ingresa cualquier email y contrasena validos para acceder al dashboard.
        </p>
      </div>

      {/* Sign up link */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Acceso por invitacion.{' '}
        <Link
          href="/signup"
          className="font-medium text-green-400 transition-colors hover:text-green-300"
        >
          Tengo un codigo de invitacion
        </Link>
      </p>
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 backdrop-blur-sm transition-all duration-200 outline-none',
    hasError
      ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
      : 'border-white/10 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/15 hover:border-white/20'
  )
}
