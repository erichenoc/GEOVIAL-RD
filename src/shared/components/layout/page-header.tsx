import { cn } from '@/shared/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-white tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
