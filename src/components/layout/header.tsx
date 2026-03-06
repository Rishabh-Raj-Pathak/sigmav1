'use client'

import { Activity, Clock, Menu, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet, truncateAddress } from '@/lib/hooks/use-wallet'

export function Header() {
  const [time, setTime] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { address, disconnectWallet } = useWallet()
  const router = useRouter()

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDisconnect = () => {
    disconnectWallet()
    router.push('/onboarding')
  }

  return (
    <header className="h-14 border-b border-sigma-border bg-sigma-surface/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-sigma-text-dim hover:text-sigma-text"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sigma-green" />
          <span className="text-sm text-sigma-text-dim">GMX v2</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sigma-green/10 text-sigma-green font-medium">
            Connected
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-sigma-amber/10 border border-sigma-amber/20">
          <span className="text-xs font-semibold text-sigma-amber">PAPER TRADING MODE</span>
        </div>

        {address && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-sigma-green/5 border border-sigma-green/20">
            <div className="w-2 h-2 rounded-full bg-sigma-green" />
            <span className="text-xs font-mono text-sigma-text-dim">{truncateAddress(address)}</span>
            <button
              onClick={handleDisconnect}
              className="text-sigma-text-dim hover:text-sigma-red transition-colors ml-1"
              title="Disconnect wallet"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-sigma-text-dim">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">{time} UTC</span>
        </div>
      </div>
    </header>
  )
}
