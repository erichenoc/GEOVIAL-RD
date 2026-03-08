import { create } from 'zustand'
import type { UserRole } from '@/shared/types'

interface DemoStore {
  role: UserRole
  setRole: (role: UserRole) => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  role: 'admin',
  setRole: (role: UserRole) => set({ role }),
}))
