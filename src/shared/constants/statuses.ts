import type { ReportStatus } from '@/shared/types'

export interface StatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  description: string
  nextStatuses: ReportStatus[]
}

export const STATUS_CONFIG: Record<ReportStatus, StatusConfig> = {
  draft: {
    label: 'Borrador',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: 'FileText',
    description: 'Reporte guardado como borrador, aún no enviado.',
    nextStatuses: ['submitted', 'cancelled'],
  },
  submitted: {
    label: 'Enviado',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: 'Send',
    description: 'Reporte enviado y pendiente de revisión.',
    nextStatuses: ['in_review', 'rejected', 'cancelled'],
  },
  in_review: {
    label: 'En Revisión',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: 'Eye',
    description: 'El reporte está siendo revisado por un supervisor.',
    nextStatuses: ['approved', 'rejected', 'cancelled'],
  },
  approved: {
    label: 'Aprobado',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    icon: 'CheckCircle',
    description: 'Reporte aprobado, listo para asignar brigada.',
    nextStatuses: ['in_progress', 'cancelled'],
  },
  in_progress: {
    label: 'En Progreso',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: 'Wrench',
    description: 'La brigada está trabajando activamente en la reparación.',
    nextStatuses: ['completed', 'cancelled'],
  },
  completed: {
    label: 'Completado',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: 'CheckSquare',
    description: 'La reparación fue completada satisfactoriamente.',
    nextStatuses: [],
  },
  rejected: {
    label: 'Rechazado',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: 'XCircle',
    description: 'Reporte rechazado. Ver comentarios para más detalles.',
    nextStatuses: ['submitted'],
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    icon: 'Ban',
    description: 'Reporte cancelado.',
    nextStatuses: [],
  },
}

export const REPORT_STATUSES = Object.keys(STATUS_CONFIG) as ReportStatus[]

export const ACTIVE_STATUSES: ReportStatus[] = [
  'submitted',
  'in_review',
  'approved',
  'in_progress',
]

export const TERMINAL_STATUSES: ReportStatus[] = [
  'completed',
  'rejected',
  'cancelled',
]

export const STATUS_FLOW_ORDER: ReportStatus[] = [
  'draft',
  'submitted',
  'in_review',
  'approved',
  'in_progress',
  'completed',
]
