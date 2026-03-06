import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  change?: number
  icon?: LucideIcon
  className?: string
}

export function MetricCard({ label, value, change, icon: Icon, className }: MetricCardProps) {
  return (
    <div className={clsx('glass-card p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-sigma-text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-sigma-text mt-2 font-mono">{value}</p>
          {change !== undefined && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              change > 0 && 'text-sigma-green',
              change < 0 && 'text-sigma-red',
              change === 0 && 'text-sigma-text-dim',
            )}>
              {change > 0 && <TrendingUp className="w-3 h-3" />}
              {change < 0 && <TrendingDown className="w-3 h-3" />}
              {change === 0 && <Minus className="w-3 h-3" />}
              <span>{change > 0 ? '+' : ''}{(change * 100).toFixed(2)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-sigma-green/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-sigma-green" />
          </div>
        )}
      </div>
    </div>
  )
}
