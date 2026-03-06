import { NextResponse } from 'next/server'
import { getEnrichedMarkets } from '@/lib/api/gmx'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const markets = await getEnrichedMarkets()
    return NextResponse.json(markets, {
      headers: { 'Cache-Control': 's-maxage=5, stale-while-revalidate=30' },
    })
  } catch (error) {
    console.error('[API] /api/markets error:', error)
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 })
  }
}
