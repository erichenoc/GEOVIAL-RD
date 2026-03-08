import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GEOVIAL RD - Gestion Vial Inteligente',
  description:
    'Sistema de gestion de danos viales para municipios de Republica Dominicana. Reporta, asigna y monitorea el mantenimiento de calles en tiempo real.',
  keywords: 'gestion vial, municipios, republica dominicana, infraestructura, carreteras',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
