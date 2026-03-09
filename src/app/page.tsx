import Link from 'next/link'
import {
  Camera,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { HeroSection } from '@/features/landing/components/hero-section'
import { DemoForm } from '@/features/landing/components/demo-form'
import { MobileMenu } from '@/features/landing/components/mobile-menu'

const FEATURES = [
  {
    icon: Camera,
    title: 'Reporta con Foto y GPS',
    description: 'Los inspectores capturan el dano con foto y ubicacion exacta desde cualquier dispositivo movil.',
  },
  {
    icon: Users,
    title: 'Asigna Brigadas',
    description: 'Supervisores asignan y gestionan brigadas de trabajo directamente desde el dashboard.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard en Tiempo Real',
    description: 'Gerencia visualiza el estado de todas las calles y trabajos en un mapa interactivo en vivo.',
  },
  {
    icon: Shield,
    title: 'Datos 100% Aislados por Municipio',
    description: 'Cada municipio opera en su propio espacio seguro. Tus datos nunca se mezclan con otros.',
  },
  {
    icon: Smartphone,
    title: 'App Movil PWA',
    description: 'Funciona en cualquier telefono sin necesidad de descargar nada. Tambien offline.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Exporta Reportes PDF/Excel',
    description: 'Genera informes ejecutivos y reportes operativos con un clic para presentar a autoridades.',
  },
]

const PROBLEMS = [
  {
    emoji: '📄',
    title: 'Reportes en papel se pierden',
    description: 'Los formularios fisicos se extravian, mojan o simplemente nadie los procesa a tiempo. La informacion critica nunca llega.',
  },
  {
    emoji: '🔍',
    title: 'Sin trazabilidad de trabajos',
    description: 'Es imposible saber quien hizo que, cuando y en que estado quedo cada reparacion. Los mismos hoyos se reparan dos veces.',
  },
  {
    emoji: '📊',
    title: 'Gerencia sin visibilidad',
    description: 'Los directivos toman decisiones sin datos reales. Se enteran de los problemas por quejas ciudadanas, no por sistemas.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Inspector detecta dano',
    description: 'El inspector de campo recorre las calles y encuentra un problema vial.',
  },
  {
    number: '02',
    title: 'Reporta con foto + GPS',
    description: 'Toma una foto, el sistema captura la ubicacion automaticamente y registra el reporte.',
  },
  {
    number: '03',
    title: 'Supervisor asigna brigada',
    description: 'El supervisor recibe la alerta, prioriza y asigna la brigada correcta al trabajo.',
  },
  {
    number: '04',
    title: 'Gerencia monitorea en tiempo real',
    description: 'La direccion ve el progreso de todos los trabajos activos en el mapa en vivo.',
  },
]

const PRICING = [
  {
    name: 'Basico',
    price: '$299',
    period: '/mes',
    description: 'Ideal para municipios pequenos que comienzan su transformacion digital.',
    features: [
      'Hasta 5 usuarios',
      'Hasta 3 barrios',
      'Reportes con foto y GPS',
      'Dashboard basico',
      'Soporte por email',
    ],
    cta: 'Comenzar Gratis',
    highlight: false,
  },
  {
    name: 'Profesional',
    price: '$799',
    period: '/mes',
    description: 'Para municipios en crecimiento que necesitan herramientas avanzadas.',
    features: [
      'Hasta 25 usuarios',
      'Barrios ilimitados',
      'Asignacion de brigadas',
      'Dashboard en tiempo real',
      'Exportacion PDF/Excel',
      'Soporte prioritario',
      'App movil PWA',
    ],
    cta: 'Solicitar Demo',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Contactar',
    period: '',
    description: 'Soluciones a medida para grandes municipios y organismos gubernamentales.',
    features: [
      'Usuarios ilimitados',
      'Integraciones a medida',
      'SLA garantizado 99.9%',
      'Capacitacion en sitio',
      'Gerente de cuenta dedicado',
      'API acceso completo',
    ],
    cta: 'Hablar con Ventas',
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#061020] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#061020]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#4A90D9] to-[#D4A017]">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                GEO<span className="text-[#D4A017]">VIAL</span>
              </span>
              <span className="hidden text-xs text-slate-500 sm:inline">RD</span>
              <span className="hidden text-[10px] text-slate-600 italic sm:inline">Infraestructura Inteligente en Accion</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-8 md:flex">
              <a href="#problema" className="text-sm text-slate-400 transition-colors hover:text-white">
                El Problema
              </a>
              <a href="#solucion" className="text-sm text-slate-400 transition-colors hover:text-white">
                Solucion
              </a>
              <a href="#como-funciona" className="text-sm text-slate-400 transition-colors hover:text-white">
                Como Funciona
              </a>
              <a href="#precios" className="text-sm text-slate-400 transition-colors hover:text-white">
                Precios
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block"
              >
                Iniciar Sesion
              </Link>
              <a
                href="#contacto"
                className="rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#FF6B35]/25"
              >
                Solicitar Demo
              </a>
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <section id="problema" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-400">
              El Problema Actual
            </span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              La gestion vial tradicional esta{' '}
              <span className="text-red-400">rota</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Los municipios dominicanos pierden millones en ineficiencias que se pueden resolver con tecnologia.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PROBLEMS.map((problem, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/5"
              >
                <div className="mb-4 text-4xl">{problem.emoji}</div>
                <h3 className="mb-3 text-xl font-semibold text-white">{problem.title}</h3>
                <p className="text-slate-400">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Solution Section */}
      <section id="solucion" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full border border-[#4A90D9]/30 bg-[#4A90D9]/10 px-4 py-1.5 text-sm font-medium text-[#4A90D9]">
              La Solucion
            </span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Todo lo que tu municipio necesita,{' '}
              <span className="text-[#4A90D9]">en un solo lugar</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              GEOVIAL RD digitaliza cada etapa del proceso vial, desde el reporte hasta la resolucion.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#4A90D9]/30 hover:bg-white/8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A90D9]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4A90D9]/10 text-[#4A90D9] transition-all duration-300 group-hover:bg-[#4A90D9]/20 group-hover:text-[#4A90D9]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full border border-[#4A90D9]/30 bg-[#4A90D9]/10 px-4 py-1.5 text-sm font-medium text-[#4A90D9]">
              Proceso Simple
            </span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Funcionando en{' '}
              <span className="text-[#4A90D9]">4 pasos</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Desde la deteccion del dano hasta su resolucion, todo conectado en tiempo real.
            </p>
          </div>

          <div className="relative">
            {/* Connector line - desktop only */}
            <div className="absolute left-0 right-0 top-[60px] hidden h-px bg-gradient-to-r from-transparent via-[#4A90D9]/30 to-transparent lg:block" />

            <div className="grid gap-8 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center text-center">
                  <div className="relative mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[#4A90D9]/50 bg-[#061020] text-2xl font-bold text-[#4A90D9] shadow-lg shadow-[#4A90D9]/20">
                    {step.number}
                    {index < STEPS.length - 1 && (
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[#4A90D9]/40 lg:block">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full border border-[#4A90D9]/30 bg-[#4A90D9]/10 px-4 py-1.5 text-sm font-medium text-[#4A90D9]">
              Precios Transparentes
            </span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Un plan para cada{' '}
              <span className="text-[#4A90D9]">municipio</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Sin cargos ocultos. Sin contratos de largo plazo. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {PRICING.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-8 transition-all duration-300',
                  plan.highlight
                    ? 'border-[#FF6B35]/50 bg-[#FF6B35]/5 shadow-xl shadow-[#FF6B35]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] px-4 py-1 text-xs font-bold text-white shadow-lg">
                      MAS POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mb-3 flex items-baseline gap-1">
                    <span className={cn('text-4xl font-bold', plan.highlight ? 'text-[#FF6B35]' : 'text-white')}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-slate-400">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', plan.highlight ? 'text-[#4A90D9]' : 'text-slate-500')} />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contacto"
                  className={cn(
                    'rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all duration-200',
                    plan.highlight
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-white hover:shadow-lg hover:shadow-[#FF6B35]/25'
                      : 'border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
                  )}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section id="contacto" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-[#4A90D9]/20 bg-gradient-to-br from-[#4A90D9]/10 via-slate-900 to-[#061020] p-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left: Copy */}
              <div>
                <span className="mb-4 inline-block rounded-full border border-[#4A90D9]/30 bg-[#4A90D9]/10 px-4 py-1.5 text-sm font-medium text-[#4A90D9]">
                  Comienza Hoy
                </span>
                <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                  Transforma la gestion vial de tu municipio
                </h2>
                <p className="mb-8 text-lg text-slate-400">
                  Agenda una demo gratuita y ve GEOVIAL RD en accion con los datos de tu municipio. Sin compromiso.
                </p>

                <div className="space-y-4">
                  {[
                    'Demo personalizada de 30 minutos',
                    'Configuracion lista en menos de 48 horas',
                    'Capacitacion incluida para tu equipo',
                    'Soporte tecnico en espanol',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4A90D9]" />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Form */}
              <DemoForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#4A90D9] to-[#D4A017]">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">
                  GEO<span className="text-[#D4A017]">VIAL</span>{' '}
                  <span className="text-slate-400">RD</span>
                </span>
              </div>
              <p className="mb-6 max-w-xs text-sm text-slate-400">
                El sistema de gestion vial inteligente para municipios de la Republica Dominicana.
              </p>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <span>Hecho con</span>
                <span className="text-red-400">♥</span>
                <span>en Republica Dominicana</span>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Producto
              </h4>
              <ul className="space-y-3">
                {['Caracteristicas', 'Precios', 'Demo', 'Actualizaciones'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>info@geovialrd.com</li>
                <li>+1 (809) 000-0000</li>
                <li>Santo Domingo, RD</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-slate-600">
            <p>2025 GEOVIAL RD. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
