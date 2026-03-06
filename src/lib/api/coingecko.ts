import { TOKEN_COINGECKO_IDS } from '../utils/constants'

const CG_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3'

const cache = new Map<string, { data: unknown; expires: number }>()

async function cachedFetch<T>(key: string, url: string, ttlMs = 60000): Promise<T | null> {
  const now = Date.now()
  const cached = cache.get(key)
  if (cached && cached.expires > now) {
    return cached.data as T
  }

  try {
    const res = await fetch(url)
    if (res.status === 429) {
      console.warn('[CoinGecko] Rate limited, using cached data')
      return (cached?.data as T) || null
    }
    if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`)
    const data = await res.json()
    cache.set(key, { data, expires: now + ttlMs })
    return data as T
  } catch (error) {
    console.error('[CoinGecko] Fetch error:', error)
    return (cached?.data as T) || null
  }
}

interface PriceData {
  usd: number
  usd_24h_change?: number
  usd_market_cap?: number
}

export async function fetchPrices(
  symbols: string[]
): Promise<Record<string, PriceData>> {
  const ids = symbols
    .map((s) => TOKEN_COINGECKO_IDS[s.toUpperCase()])
    .filter(Boolean)

  if (!ids.length) return {}

  const idsStr = ids.join(',')
  const url = `${CG_BASE}/simple/price?ids=${idsStr}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`

  const data = await cachedFetch<Record<string, PriceData>>(`prices_${idsStr}`, url)
  if (!data) return {}

  const result: Record<string, PriceData> = {}
  for (const symbol of symbols) {
    const id = TOKEN_COINGECKO_IDS[symbol.toUpperCase()]
    if (id && data[id]) {
      result[symbol.toUpperCase()] = data[id]
    }
  }

  return result
}

export async function fetchHistoricalPrices(
  symbol: string,
  days: number
): Promise<[number, number][]> {
  const id = TOKEN_COINGECKO_IDS[symbol.toUpperCase()]
  if (!id) return []

  const url = `${CG_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  const data = await cachedFetch<{ prices: [number, number][] }>(
    `history_${id}_${days}`,
    url,
    300000
  )

  return data?.prices || []
}
