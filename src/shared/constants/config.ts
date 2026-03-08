import type { DamageSeverity } from '@/shared/types'

// ─────────────────────────────────────────────────────────────────────────────
// App Identity
// ─────────────────────────────────────────────────────────────────────────────

export const APP_NAME = 'GEOVIAL'
export const APP_FULL_NAME = 'GEOVIAL - Sistema de Gestión Vial'
export const APP_DESCRIPTION = 'Plataforma de reporte y gestión de daños viales para municipios de la República Dominicana.'
export const APP_VERSION = '1.0.0'

// ─────────────────────────────────────────────────────────────────────────────
// Map Configuration (Santo Domingo, Dominican Republic)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_MAP_CENTER: [number, number] = [18.4861, -69.9312]
export const DEFAULT_MAP_ZOOM = 13
export const MIN_MAP_ZOOM = 10
export const MAX_MAP_ZOOM = 19
export const CLUSTER_RADIUS = 60

// Bounding box for Dominican Republic (for validation)
export const DR_BOUNDS = {
  north: 19.9307,
  south: 17.4706,
  east: -68.3204,
  west: -72.0095,
}

// ─────────────────────────────────────────────────────────────────────────────
// Severity
// ─────────────────────────────────────────────────────────────────────────────

export interface SeverityConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  badgeColor: string
  hexColor: string
  responseDays: number
  icon: string
}

export const SEVERITY_CONFIG: Record<DamageSeverity, SeverityConfig> = {
  low: {
    label: 'Baja',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    badgeColor: 'bg-green-100 text-green-800',
    hexColor: '#16a34a',
    responseDays: 30,
    icon: 'ArrowDown',
  },
  medium: {
    label: 'Media',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    hexColor: '#ca8a04',
    responseDays: 14,
    icon: 'Minus',
  },
  high: {
    label: 'Alta',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    badgeColor: 'bg-orange-100 text-orange-800',
    hexColor: '#ea580c',
    responseDays: 7,
    icon: 'ArrowUp',
  },
  critical: {
    label: 'Crítica',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    badgeColor: 'bg-red-100 text-red-800',
    hexColor: '#dc2626',
    responseDays: 2,
    icon: 'AlertTriangle',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ─────────────────────────────────────────────────────────────────────────────
// File Upload
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_PHOTO_SIZE_MB = 10
export const MAX_PHOTOS_PER_REPORT = 10
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

// ─────────────────────────────────────────────────────────────────────────────
// Date / Time
// ─────────────────────────────────────────────────────────────────────────────

export const DATE_LOCALE = 'es-DO'
export const TIMEZONE = 'America/Santo_Domingo'

// ─────────────────────────────────────────────────────────────────────────────
// Report Number
// ─────────────────────────────────────────────────────────────────────────────

export const REPORT_NUMBER_PREFIX = 'GVL'
export const REPORT_NUMBER_YEAR_FORMAT = 'YY'
