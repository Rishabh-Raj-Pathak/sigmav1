'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sigmav_wallet'

export interface WalletState {
  address: string | null
  connectedDexes: string[]
  activePairs: string[]
}

const DEFAULT_STATE: WalletState = {
  address: null,
  connectedDexes: [],
  activePairs: [],
}

function loadState(): WalletState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return JSON.parse(raw) as WalletState
  } catch {
    return DEFAULT_STATE
  }
}

function saveState(state: WalletState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function generateAddress(): string {
  const hex = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) {
    addr += hex[Math.floor(Math.random() * 16)]
  }
  return addr
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  const update = useCallback((partial: Partial<WalletState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial }
      saveState(next)
      return next
    })
  }, [])

  const connectWallet = useCallback(() => {
    const address = generateAddress()
    update({ address })
    return address
  }, [update])

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(DEFAULT_STATE)
  }, [])

  const toggleDex = useCallback((dex: string) => {
    setState((prev) => {
      const has = prev.connectedDexes.includes(dex)
      const connectedDexes = has
        ? prev.connectedDexes.filter((d) => d !== dex)
        : [...prev.connectedDexes, dex]
      // Remove any pairs that reference disconnected DEX
      const activePairs = has
        ? prev.activePairs.filter((p) => !p.includes(dex))
        : prev.activePairs
      const next = { ...prev, connectedDexes, activePairs }
      saveState(next)
      return next
    })
  }, [])

  const togglePair = useCallback((pair: string) => {
    setState((prev) => {
      const has = prev.activePairs.includes(pair)
      const activePairs = has
        ? prev.activePairs.filter((p) => p !== pair)
        : [...prev.activePairs, pair]
      const next = { ...prev, activePairs }
      saveState(next)
      return next
    })
  }, [])

  return {
    ...state,
    hydrated,
    isConnected: !!state.address,
    connectWallet,
    disconnectWallet,
    toggleDex,
    togglePair,
    update,
  }
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
