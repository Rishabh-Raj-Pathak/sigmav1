'use client'

import { Wallet, BarChart3, TrendingUp, Percent } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import { MetricSkeleton } from '@/components/ui/skeleton'
import { useVault } from '@/lib/hooks/use-vault'
import { useFundingRates } from '@/lib/hooks/use-funding-rates'
import { formatUsd, formatPnl, formatAnnualizedRate } from '@/lib/utils/formatting'

export function OverviewMetrics() {
  const { data: vault, isLoading: vaultLoading } = useVault()
  const { data: rates, isLoading: ratesLoading } = useFundingRates()

  if (vaultLoading || ratesLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    )
  }

  const bestSpread = rates?.length
    ? Math.max(...rates.map((r) => r.venueComparison.maxSpread))
    : 0

  const pnlChange = vault && vault.totalValueUsd > 0
    ? vault.totalPnl / vault.totalValueUsd
    : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Vault Value"
        value={formatUsd(vault?.totalValueUsd ?? 0)}
        icon={Wallet}
      />
      <MetricCard
        label="Active Positions"
        value={String(vault?.numPositions ?? 0)}
        icon={BarChart3}
      />
      <MetricCard
        label="24h P&L"
        value={formatPnl(vault?.totalPnl ?? 0)}
        change={pnlChange}
        icon={TrendingUp}
      />
      <MetricCard
        label="Best Spread"
        value={formatAnnualizedRate(bestSpread)}
        icon={Percent}
      />
    </div>
  )
}
