import { NextResponse } from 'next/server'
import { getEnrichedMarkets } from '@/lib/api/gmx'
import { detectOpportunities } from '@/lib/engine/opportunity-detector'
import { getStrategyConfig, getOpenTrades } from '@/lib/db/queries'
import { shouldEnterPosition } from '@/lib/engine/opportunity-detector'
import type { OpportunityWithAction } from '@/lib/utils/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [markets, config, openTrades] = await Promise.all([
      getEnrichedMarkets(),
      Promise.resolve(getStrategyConfig()),
      Promise.resolve(getOpenTrades()),
    ])

    const candidates = detectOpportunities(markets, config)

    const opportunities: OpportunityWithAction[] = candidates.map((c) => {
      const { enter, reason } = shouldEnterPosition(c, openTrades, config)
      return {
        tokenSymbol: c.tokenSymbol,
        longVenue: c.longVenue,
        shortVenue: c.shortVenue,
        fundingSpread: c.fundingSpread,
        entryPrice: c.entryPrice,
        estimatedApr: c.estimatedApr,
        riskScore: c.riskScore,
        status: 'active' as const,
        detectedAt: Math.floor(Date.now() / 1000),
        canTakePosition: enter,
        reason: enter ? undefined : reason,
      }
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('[API] /api/opportunities error:', error)
    return NextResponse.json({ error: 'Failed to detect opportunities' }, { status: 500 })
  }
}
