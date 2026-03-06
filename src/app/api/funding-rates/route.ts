import { NextResponse } from 'next/server'
import { getEnrichedMarkets } from '@/lib/api/gmx'
import { generateSimulatedVenueRates, getVenueComparison } from '@/lib/engine/funding-analyzer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const markets = await getEnrichedMarkets()
    const now = Math.floor(Date.now() / 1000)

    const ratesWithComparisons = markets.map((market) => {
      const simRates = generateSimulatedVenueRates(
        market.fundingRateLong,
        market.tokenSymbol,
        now
      )
      const comparison = getVenueComparison(market, simRates)

      return {
        ...market,
        venueComparison: comparison,
      }
    })

    return NextResponse.json(ratesWithComparisons, {
      headers: { 'Cache-Control': 's-maxage=5, stale-while-revalidate=30' },
    })
  } catch (error) {
    console.error('[API] /api/funding-rates error:', error)
    return NextResponse.json({ error: 'Failed to fetch funding rates' }, { status: 500 })
  }
}
