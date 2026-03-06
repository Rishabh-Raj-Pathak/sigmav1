'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FundingRateWithComparison } from '@/lib/hooks/use-funding-rates'
import { formatRate, formatUsd, formatAnnualizedRate, rateToColor } from '@/lib/utils/formatting'

interface MarketDetailCardProps {
  market: FundingRateWithComparison | null
}

export function MarketDetailCard({ market }: MarketDetailCardProps) {
  if (!market) {
    return (
      <Card className="flex items-center justify-center min-h-[240px]">
        <p className="text-sm text-sigma-text-muted">Select a market to view details</p>
      </Card>
    )
  }

  const totalOI = market.openInterestLong + market.openInterestShort
  const longPct = totalOI > 0 ? (market.openInterestLong / totalOI) * 100 : 50

  return (
    <Card
      title={market.tokenSymbol}
      subtitle={market.marketName}
      headerRight={
        <Badge variant="green" pulse>
          Live
        </Badge>
      }
    >
      <div className="space-y-5">
        {/* Venue Rates */}
        <div>
          <h4 className="text-xs font-medium text-sigma-text-muted uppercase tracking-wider mb-2">
            Venue Rates
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sigma-text-dim">GMX Long</span>
              <span className={`font-mono ${rateToColor(market.fundingRateLong)}`}>
                {formatRate(market.fundingRateLong)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-sigma-text-dim">GMX Short</span>
              <span className={`font-mono ${rateToColor(market.fundingRateShort)}`}>
                {formatRate(market.fundingRateShort)}
              </span>
            </div>
            {market.venueComparison.venues.map((v) => (
              <div key={v.name} className="flex items-center justify-between text-sm">
                <span className="text-sigma-text-dim">
                  {v.name}
                  {v.isSimulated && (
                    <span className="text-[10px] text-sigma-text-muted ml-1">(sim)</span>
                  )}
                </span>
                <span className={`font-mono ${rateToColor(v.fundingRate)}`}>
                  {formatRate(v.fundingRate)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spread Info */}
        <div>
          <h4 className="text-xs font-medium text-sigma-text-muted uppercase tracking-wider mb-2">
            Spread
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sigma-text-dim">Max Spread (Ann.)</span>
              <span className="font-mono text-sigma-green font-medium">
                {formatAnnualizedRate(market.venueComparison.maxSpread)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-sigma-text-dim">Best Long</span>
              <span className="text-sigma-text">{market.venueComparison.bestLong}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-sigma-text-dim">Best Short</span>
              <span className="text-sigma-text">{market.venueComparison.bestShort}</span>
            </div>
          </div>
        </div>

        {/* OI Breakdown */}
        <div>
          <h4 className="text-xs font-medium text-sigma-text-muted uppercase tracking-wider mb-2">
            Open Interest
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sigma-green text-xs">Long {formatUsd(market.openInterestLong)}</span>
              <span className="text-sigma-red text-xs">Short {formatUsd(market.openInterestShort)}</span>
            </div>
            <div className="h-2 rounded-full bg-sigma-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-sigma-green transition-all"
                style={{ width: `${longPct}%` }}
              />
            </div>
            <p className="text-xs text-sigma-text-dim text-center">
              Total: {formatUsd(totalOI)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
