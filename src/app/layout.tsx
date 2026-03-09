import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GEOVIAL RD - Infraestructura Inteligente en Acción',
  description:
    'Sistema de monitoreo y gestión de infraestructura vial para municipios de República Dominicana. Reporta, asigna y monitorea el mantenimiento de calles en tiempo real.',
  keywords: 'gestion vial, municipios, republica dominicana, infraestructura, carreteras, obras publicas',
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
