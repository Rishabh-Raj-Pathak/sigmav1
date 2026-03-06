import { clsx } from 'clsx'

interface CardProps {
  title?: string
  subtitle?: string
  className?: string
  children: React.ReactNode
  headerRight?: React.ReactNode
  hover?: boolean
}

export function Card({ title, subtitle, className, children, headerRight, hover }: CardProps) {
  return (
    <div className={clsx(hover ? 'glass-card-hover' : 'glass-card', 'p-5', className)}>
      {(title || headerRight) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-sigma-text">{title}</h3>}
            {subtitle && <p className="text-xs text-sigma-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  )
}
