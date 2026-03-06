'use client'

import { usePolling } from './use-polling'
import type { VaultState } from '@/lib/utils/types'

export function useVault() {
  return usePolling<VaultState>('/api/vault')
}
