import { cn } from '@/shared/lib/utils'
import type { ReportStatus, DamageSeverity } from '@/shared/types'

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ReportStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_progress: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Borrador',
  submitted: 'Enviado',
  in_review: 'En Revision',
  approved: 'Aprobado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<DamageSeverity, string> = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
}

const SEVERITY_LABELS: Record<DamageSeverity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
}

const SEVERITY_DOT: Record<DamageSeverity, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

// ─── Generic Badge ────────────────────────────────────────────────────────────

interface BaseBadgeProps {
  className?: string
  size?: 'sm' | 'md'
}

interface StatusBadgeProps extends BaseBadgeProps {
  status: ReportStatus
}

interface SeverityBadgeProps extends BaseBadgeProps {
  severity: DamageSeverity
}

interface GenericBadgeProps extends BaseBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline'
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md border',
        sizeClasses[size],
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export function SeverityBadge({ severity, size = 'md', className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md border',
        sizeClasses[size],
        SEVERITY_STYLES[severity],
        className
      )}
    >
      <span
        className={cn('inline-block w-1.5 h-1.5 rounded-full', SEVERITY_DOT[severity])}
        aria-hidden="true"
      />
      {SEVERITY_LABELS[severity]}
    </span>
  )
}

export function Badge({ children, size = 'md', variant = 'default', className }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md',
        sizeClasses[size],
        variant === 'default'
          ? 'bg-slate-100 text-slate-700 border border-slate-200'
          : 'border border-current bg-transparent',
        className
      )}
    >
      {children}
    </span>
  )
}
