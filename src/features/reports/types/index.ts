import type { DamageSeverity, ReportStatus } from '@/shared/types'

export interface MockReport {
  id: string
  report_number: string
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  zone_name: string
  sector_name: string
  damage_type: {
    name: string
    code: string
  }
  severity: DamageSeverity
  status: ReportStatus
  reported_by: string
  reported_at: string
  brigade_name: string | null
  photo_color: string
}

export interface MockComment {
  id: string
  user_name: string
  user_initials: string
  role: string
  content: string
  created_at: string
}

export interface MockStatusHistory {
  id: string
  status: ReportStatus
  changed_by: string
  note: string | null
  changed_at: string
}
