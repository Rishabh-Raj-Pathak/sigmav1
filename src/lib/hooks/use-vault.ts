'use client'

import { useEffect, useState } from 'react'
import { usePolling } from './use-polling'
import type { VaultState } from '@/lib/utils/types'

const STORAGE_KEY = 'sigmav_vault_state'

function loadStoredVault(): VaultState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as VaultState
  } catch {
    return null
  }
}

function saveStoredVault(state: VaultState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / serialization errors
  }
}

export function useVault() {
  const swr = usePolling<VaultState>('/api/vault')
  const { data, isLoading, error } = swr

  const [stored, setStored] = useState<VaultState | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on first client render
  useEffect(() => {
    const initial = loadStoredVault()
    if (initial) {
      setStored(initial)
    }
    setHydrated(true)
  }, [])

  // Whenever fresh server data arrives, treat it as source of truth
  useEffect(() => {
    if (!data) return
    setStored(data)
    saveStoredVault(data)
  }, [data])

  const effectiveData = stored ?? data
  const effectiveLoading = !hydrated && isLoading

  return {
    ...swr,
    data: effectiveData,
    isLoading: effectiveLoading,
    error,
  }
}
