// ─────────────────────────────────────────────────────────────────────────────
// Enums / Union Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'inspector'
  | 'supervisor'
  | 'gerente'
  | 'admin'
  | 'super_admin'

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export type PhotoType = 'before' | 'during' | 'after'

export type DamageSeverity = 'low' | 'medium' | 'high' | 'critical'

export type NotificationType =
  | 'report_submitted'
  | 'report_approved'
  | 'report_rejected'
  | 'report_assigned'
  | 'report_completed'
  | 'comment_added'
  | 'status_changed'

// ─────────────────────────────────────────────────────────────────────────────
// Organization
// ─────────────────────────────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  address: string | null
  phone: string | null
  email: string | null
  city: string
  country: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  organization_id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  organization?: Organization
}

// ─────────────────────────────────────────────────────────────────────────────
// Geography
// ─────────────────────────────────────────────────────────────────────────────

export interface Zone {
  id: string
  organization_id: string
  name: string
  description: string | null
  color_hex: string
  is_active: boolean
  created_at: string
}

export interface Sector {
  id: string
  zone_id: string
  organization_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  zone?: Zone
}

// ─────────────────────────────────────────────────────────────────────────────
// Brigade
// ─────────────────────────────────────────────────────────────────────────────

export interface Brigade {
  id: string
  organization_id: string
  name: string
  description: string | null
  supervisor_id: string | null
  is_active: boolean
  created_at: string
  supervisor?: UserProfile
  members?: BrigadeMember[]
}

export interface BrigadeMember {
  id: string
  brigade_id: string
  user_id: string
  joined_at: string
  user?: UserProfile
}

// ─────────────────────────────────────────────────────────────────────────────
// Damage Reference Data
// ─────────────────────────────────────────────────────────────────────────────

export interface DamageType {
  code: string
  name: string
  icon: string
  description: string
}

export interface DamageSeverityLevel {
  level: DamageSeverity
  name: string
  color_hex: string
  response_days: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportPhoto {
  id: string
  report_id: string
  photo_url: string
  photo_type: PhotoType
  caption: string | null
  uploaded_by: string
  uploaded_at: string
  uploader?: UserProfile
}

export interface ReportComment {
  id: string
  report_id: string
  user_id: string
  content: string
  is_internal: boolean
  created_at: string
  updated_at: string
  user?: UserProfile
}

export interface StatusHistoryEntry {
  id: string
  report_id: string
  previous_status: ReportStatus | null
  new_status: ReportStatus
  changed_by: string
  note: string | null
  changed_at: string
  user?: UserProfile
}

export interface Report {
  id: string
  report_number: string
  organization_id: string
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  zone_id: string | null
  sector_id: string | null
  damage_type: string
  severity: DamageSeverity
  status: ReportStatus
  brigade_id: string | null
  reported_by: string
  assigned_to: string | null
  estimated_cost: number | null
  actual_cost: number | null
  priority_score: number
  reported_at: string
  submitted_at: string | null
  approved_at: string | null
  started_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  // Relations
  zone?: Zone
  sector?: Sector
  brigade?: Brigade
  reporter?: UserProfile
  assignee?: UserProfile
  photos?: ReportPhoto[]
  comments?: ReportComment[]
  status_history?: StatusHistoryEntry[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  report_id: string | null
  is_read: boolean
  created_at: string
  report?: Pick<Report, 'id' | 'report_number' | 'title'>
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_reports: number
  open_reports: number
  in_progress_reports: number
  completed_reports: number
  critical_reports: number
  reports_this_month: number
  reports_last_month: number
  avg_resolution_days: number
  completion_rate: number
  by_status: Record<ReportStatus, number>
  by_severity: Record<DamageSeverity, number>
  by_zone: Array<{ zone_name: string; count: number; color: string }>
  by_damage_type: Array<{ damage_type: string; count: number }>
  monthly_trend: Array<{ month: string; submitted: number; completed: number }>
}

// ─────────────────────────────────────────────────────────────────────────────
// API Helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}
