import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

const STATS = [
  { value: '158+', label: 'Municipios' },
  { value: '12,800+', label: 'Barrios' },
  { value: 'Nacional', label: 'Cobertura' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#061020] pt-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#4A90D9]/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#D4A017]/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[800px] rounded-full bg-[#4A90D9]/5 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Text content */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4A90D9]/30 bg-[#4A90D9]/10 px-4 py-2 text-sm text-[#4A90D9]">
              <span className="h-2 w-2 rounded-full bg-[#4A90D9] animate-pulse" />
              Plataforma certificada para municipios RD
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Gestion Vial{' '}
              <span className="bg-gradient-to-r from-[#4A90D9] to-[#D4A017] bg-clip-text text-transparent">
                Inteligente
              </span>{' '}
              para tu Municipio
            </h1>

            {/* Subtitle */}
            <p className="mb-10 text-lg leading-relaxed text-slate-400 sm:text-xl">
              Transforma el mantenimiento de calles con tecnologia. Reporta danos con GPS, asigna brigadas y monitorea cada trabajo en tiempo real desde cualquier dispositivo.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#contacto"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:shadow-xl hover:shadow-[#FF6B35]/30"
              >
                Solicitar Demo Gratis
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10"
              >
                Ver Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 flex flex-wrap gap-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Abstract hero visual */}
          <div className="animate-fade-in delay-300 relative hidden lg:flex lg:items-center lg:justify-center">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#061020] to-transparent" />
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative h-[520px] w-[520px]">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-[#4A90D9]/10" />
      <div className="absolute inset-8 rounded-full border border-[#4A90D9]/15" />
      <div className="absolute inset-16 rounded-full border border-[#4A90D9]/20" />

      {/* Center card - Dashboard preview */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 animate-float">
        <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-[#4A90D9] to-[#D4A017] flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Mapa en Vivo</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-[#22C55E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              En vivo
            </span>
          </div>

          {/* Mock map grid */}
          <div className="mb-4 h-36 w-full overflow-hidden rounded-xl bg-slate-800/80 relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(rgba(74,144,217,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,0.3) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
            {/* Mock pins */}
            {[
              { top: '25%', left: '30%', color: 'bg-red-400' },
              { top: '55%', left: '60%', color: 'bg-yellow-400' },
              { top: '40%', left: '70%', color: 'bg-green-400' },
              { top: '70%', left: '25%', color: 'bg-red-400' },
            ].map((pin, i) => (
              <div
                key={i}
                className={`absolute h-3 w-3 rounded-full ${pin.color} shadow-lg ring-2 ring-white/20`}
                style={{ top: pin.top, left: pin.left }}
              />
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Reportes', value: '24', color: 'text-red-400' },
              { label: 'En curso', value: '8', color: 'text-yellow-400' },
              { label: 'Resueltos', value: '142', color: 'text-green-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-800/60 p-2.5 text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification cards */}
      <div className="absolute left-0 top-[15%] animate-float delay-200">
        <div className="rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
              📍
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Nuevo reporte</div>
              <div className="text-[11px] text-slate-500">Av. Winston Churchill</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-0 bottom-[20%] animate-float delay-500">
        <div className="rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
              ✓
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Trabajo completado</div>
              <div className="text-[11px] text-slate-500">Brigada #4 - SDO</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
