'use client'

import { usePolling } from './use-polling'
import type { MarketData } from '@/lib/utils/types'

export function useMarkets() {
  return usePolling<MarketData[]>('/api/markets')
}
