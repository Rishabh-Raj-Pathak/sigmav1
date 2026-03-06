'use client'

import { usePolling } from './use-polling'
import type { OpportunityWithAction } from '@/lib/utils/types'

export function useOpportunities() {
  return usePolling<OpportunityWithAction[]>('/api/opportunities')
}
