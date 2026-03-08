'use client'

import { cn } from '@/shared/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function ChartCard({ title, description, children, className, action }: ChartCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden',
        className
      )}
    >
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-50">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 leading-tight">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          )}
        </div>
        {action && <div className="ml-4 flex-shrink-0">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
