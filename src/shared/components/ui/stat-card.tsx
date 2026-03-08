import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  iconColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  iconColor = 'bg-slate-100 text-slate-600',
  className,
}: StatCardProps) {
  const showChange = change !== undefined

  const trendConfig = {
    up: {
      icon: <TrendingUp size={13} />,
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      label: `+${Math.abs(change ?? 0)}% vs mes anterior`,
    },
    down: {
      icon: <TrendingDown size={13} />,
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      label: `-${Math.abs(change ?? 0)}% vs mes anterior`,
    },
    neutral: {
      icon: <Minus size={13} />,
      textColor: 'text-slate-500',
      bgColor: 'bg-slate-50',
      label: 'Sin cambio vs mes anterior',
    },
  }

  const currentTrend = trendConfig[trend]

  return (
    <article
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
            iconColor
          )}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Change indicator */}
        {showChange && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              currentTrend.textColor,
              currentTrend.bgColor
            )}
            title={currentTrend.label}
          >
            {currentTrend.icon}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p
          className="text-3xl font-bold text-slate-900 tracking-tight leading-none"
          aria-label={`${title}: ${value}`}
        >
          {value}
        </p>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">{title}</p>
      </div>

      {/* Trend description (screen reader) */}
      {showChange && (
        <p className="sr-only">{currentTrend.label}</p>
      )}
    </article>
  )
}
