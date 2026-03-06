import { NextRequest, NextResponse } from 'next/server'
import { fetchPrices } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')
    const symbols = symbolsParam
      ? symbolsParam.split(',')
      : ['BTC', 'ETH', 'AVAX', 'SOL', 'LINK']

    const prices = await fetchPrices(symbols)
    return NextResponse.json(prices, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('[API] /api/prices error:', error)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
