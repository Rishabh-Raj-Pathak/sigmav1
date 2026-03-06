'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, Vault, Settings2, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: BarChart3 },
  { href: '/vault', label: 'Vault', icon: Vault },
  { href: '/strategy', label: 'Strategy', icon: Settings2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sigma-surface border-r border-sigma-border">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sigma-green/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-sigma-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sigma-text glow-text">SigmaV</h1>
            <p className="text-xs text-sigma-text-muted">Funding Arbitrage</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sigma-green/10 text-sigma-green border-l-2 border-sigma-green shadow-glow'
                  : 'text-sigma-text-dim hover:text-sigma-text hover:bg-sigma-surface-hover'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-lg bg-sigma-amber/10 border border-sigma-amber/20">
        <p className="text-xs font-semibold text-sigma-amber">PAPER TRADING</p>
        <p className="text-xs text-sigma-text-muted mt-1">Simulated positions only</p>
      </div>

      <div className="p-4 border-t border-sigma-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sigma-green animate-pulse" />
          <span className="text-xs text-sigma-text-dim">Avalanche C-Chain</span>
        </div>
      </div>
    </aside>
  )
}
