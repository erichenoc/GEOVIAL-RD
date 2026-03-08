'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '#problema', label: 'El Problema' },
  { href: '#solucion', label: 'Solucion' },
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '#precios', label: 'Precios' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-white/10 bg-slate-950/95 px-4 py-6 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Iniciar Sesion
              </Link>
              <a
                href="#contacto"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-green-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-green-400"
              >
                Solicitar Demo
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
