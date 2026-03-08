'use client'

import { Sidebar } from '@/shared/components/layout/sidebar'
import { Topbar } from '@/shared/components/layout/topbar'
import { MobileNav } from '@/shared/components/layout/mobile-nav'
import { useDemoStore } from '@/shared/stores/demo-store'

const DEMO_USER = {
  userName: 'Carlos Marte',
  userEmail: 'carlos.marte@ayuntamiento.do',
  orgName: 'Ayuntamiento DN',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role } = useDemoStore()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        role={role}
        userName={DEMO_USER.userName}
        orgName={DEMO_USER.orgName}
      />

      {/* Mobile slide-over nav */}
      <MobileNav />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          userName={DEMO_USER.userName}
          userEmail={DEMO_USER.userEmail}
          orgName={DEMO_USER.orgName}
          notificationCount={4}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
