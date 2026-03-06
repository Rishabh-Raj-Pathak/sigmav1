'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useOpportunities } from '@/lib/hooks/use-opportunities'
import { formatAnnualizedRate, formatPercentage } from '@/lib/utils/formatting'

export function OpportunityFeed() {
  const { data: opportunities, isLoading } = useOpportunities()
  const [takingId, setTakingId] = useState<number | null>(null)

  const handleTakePosition = async (opp: NonNullable<typeof opportunities>[number]) => {
    setTakingId(opp.id ?? -1)
    try {
      const res = await fetch('/api/paper-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opp.id,
          tokenSymbol: opp.tokenSymbol,
          entryPrice: opp.entryPrice,
          positionSizeUsd: 10000,
          leverage: 1,
        }),
      })
      if (!res.ok) throw new Error('Failed to take position')
      await mutate('/api/vault')
      await mutate('/api/opportunities')
    } catch (err) {
      console.error('Take position failed:', err)
    } finally {
      setTakingId(null)
    }
  }

  const riskVariant = (score: number) => {
    if (score < 40) return 'green' as const
    if (score < 70) return 'amber' as const
    return 'red' as const
  }

  return (
    <Card title="Opportunities" subtitle="Live funding rate arbitrage signals">
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : !opportunities?.length ? (
        <p className="text-sm text-sigma-text-muted text-center py-6">
          No opportunities detected
        </p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {opportunities.map((opp) => (
            <div
              key={opp.id ?? opp.tokenSymbol}
              className="glass-card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-sigma-text">
                    {opp.tokenSymbol}
                  </span>
                  <Badge variant={riskVariant(opp.riskScore)}>
                    Risk {opp.riskScore}
                  </Badge>
                </div>
                <p className="text-xs text-sigma-text-muted">
                  {opp.longVenue} &rarr; {opp.shortVenue}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-sigma-text-dim">
                    Spread{' '}
                    <span className="text-sigma-green font-mono">
                      {formatAnnualizedRate(opp.fundingSpread)}
                    </span>
                  </span>
                  <span className="text-xs text-sigma-text-dim">
                    APR{' '}
                    <span className="text-sigma-green font-mono">
                      {formatPercentage(opp.estimatedApr / 100)}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleTakePosition(opp)}
                disabled={!opp.canTakePosition || takingId === (opp.id ?? -1)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sigma-green/10 text-sigma-green border border-sigma-green/20 hover:bg-sigma-green/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {takingId === (opp.id ?? -1) ? 'Opening...' : 'Take Position'}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
