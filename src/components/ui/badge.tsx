import { clsx } from 'clsx'

type BadgeVariant = 'green' | 'red' | 'amber' | 'neutral' | 'blue'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  pulse?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-sigma-green/10 text-sigma-green border-sigma-green/20',
  red: 'bg-sigma-red/10 text-sigma-red border-sigma-red/20',
  amber: 'bg-sigma-amber/10 text-sigma-amber border-sigma-amber/20',
  neutral: 'bg-sigma-surface text-sigma-text-dim border-sigma-border',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export function Badge({ children, variant = 'neutral', className, pulse }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border',
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className={clsx(
          'w-1.5 h-1.5 rounded-full animate-pulse',
          variant === 'green' && 'bg-sigma-green',
          variant === 'red' && 'bg-sigma-red',
          variant === 'amber' && 'bg-sigma-amber',
        )} />
      )}
      {children}
    </span>
  )
}
