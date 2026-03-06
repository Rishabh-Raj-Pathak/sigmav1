import { NextRequest, NextResponse } from 'next/server'
import { getFundingRateHistory } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const market = searchParams.get('market')
    const hours = parseInt(searchParams.get('hours') || '24')

    if (!market) {
      return NextResponse.json({ error: 'market parameter required' }, { status: 400 })
    }

    const history = getFundingRateHistory(market, hours)
    return NextResponse.json(history)
  } catch (error) {
    console.error('[API] /api/funding-rates/history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
