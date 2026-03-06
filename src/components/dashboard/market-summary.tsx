'use client'

import { Card } from '@/components/ui/card'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useFundingRates } from '@/lib/hooks/use-funding-rates'
import { formatRate, rateToColor, formatUsd } from '@/lib/utils/formatting'

export function MarketSummary() {
  const { data: rates, isLoading } = useFundingRates()

  const top5 = rates
    ? [...rates]
        .sort(
          (a, b) =>
            Math.abs(b.fundingRateLong) - Math.abs(a.fundingRateLong)
        )
        .slice(0, 5)
    : []

  return (
    <Card title="Market Summary" subtitle="Top 5 by funding rate">
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : !top5.length ? (
        <p className="text-sm text-sigma-text-muted text-center py-6">
          No market data
        </p>
      ) : (
        <div className="space-y-3">
          {top5.map((m) => {
            const totalOI = m.openInterestLong + m.openInterestShort
            const longPct = totalOI > 0 ? (m.openInterestLong / totalOI) * 100 : 50

            return (
              <div key={m.marketToken} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-sigma-text w-14 shrink-0">
                  {m.tokenSymbol}
                </span>
                <span
                  className={`text-xs font-mono w-20 text-right shrink-0 ${rateToColor(
                    m.fundingRateLong
                  )}`}
                >
                  {formatRate(m.fundingRateLong)}
                </span>
                <div className="flex-1 h-2 rounded-full bg-sigma-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sigma-green transition-all"
                    style={{ width: `${longPct}%` }}
                  />
                </div>
                <span className="text-xs text-sigma-text-dim w-16 text-right shrink-0">
                  {formatUsd(totalOI)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
