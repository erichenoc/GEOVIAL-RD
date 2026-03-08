import Link from 'next/link'
import { MapPin, Shield, BarChart3, Users } from 'lucide-react'

const FEATURES = [
  { icon: Shield, text: 'Datos 100% seguros y aislados por municipio' },
  { icon: BarChart3, text: 'Dashboard en tiempo real con mapa interactivo' },
  { icon: Users, text: 'Gestion de brigadas y equipos de trabajo' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left: Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[100px]" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-green-500/8 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Top: Logo */}
        <Link href="/" className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 shadow-lg shadow-green-500/30">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            GEO<span className="text-green-500">VIAL</span>
            <span className="ml-1 text-slate-400">RD</span>
          </span>
        </Link>

        {/* Middle: Illustration + copy */}
        <div className="relative flex flex-col items-start">
          {/* Abstract map illustration */}
          <div className="mb-10 w-full max-w-sm">
            <AuthIllustration />
          </div>

          <h2 className="mb-4 text-3xl font-bold leading-tight text-white">
            Gestion vial moderna para tu municipio
          </h2>
          <p className="mb-8 text-slate-400">
            Unete a mas de 158 municipios que ya transformaron su infraestructura vial con GEOVIAL RD.
          </p>

          {/* Feature bullets */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/15 text-green-400">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Tagline */}
        <div className="relative">
          <p className="text-xs text-slate-600">
            Hecho con ♥ en Republica Dominicana &middot; geovialrd.com
          </p>
        </div>
      </div>

      {/* Right: Form area */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            GEO<span className="text-green-500">VIAL</span>
            <span className="ml-1 text-slate-400">RD</span>
          </span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}

function AuthIllustration() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
      {/* Road lines */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-green-500/30" />
      <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-green-500/30" />

      {/* Location pins */}
      {[
        { top: '20%', left: '25%', color: 'bg-red-400', size: 'h-3 w-3' },
        { top: '60%', left: '65%', color: 'bg-yellow-400', size: 'h-3 w-3' },
        { top: '35%', left: '70%', color: 'bg-green-400', size: 'h-4 w-4' },
        { top: '75%', left: '30%', color: 'bg-red-400', size: 'h-3 w-3' },
        { top: '45%', left: '50%', color: 'bg-green-400', size: 'h-3.5 w-3.5' },
      ].map((pin, i) => (
        <div
          key={i}
          className={`absolute ${pin.size} rounded-full ${pin.color} shadow-md ring-2 ring-white/20`}
          style={{ top: pin.top, left: pin.left }}
        />
      ))}

      {/* Status badge */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        En vivo
      </div>
    </div>
  )
}
