'use client'

import { usePolling } from './use-polling'
import type { MarketData, VenueComparison } from '@/lib/utils/types'

export type FundingRateWithComparison = MarketData & {
  venueComparison: VenueComparison
}

export function useFundingRates() {
  return usePolling<FundingRateWithComparison[]>('/api/funding-rates')
}
