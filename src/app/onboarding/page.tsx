'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet, truncateAddress } from '@/lib/hooks/use-wallet'

const SUPPORTED_DEXES = ['HyperLiquid', 'Paradex']
const AVAILABLE_PAIRS = ['GMX / HyperLiquid', 'GMX / Paradex']

export default function OnboardingPage() {
  const router = useRouter()
  const wallet = useWallet()
  const [step, setStep] = useState(1)

  const handleConnect = () => {
    wallet.connectWallet()
    setStep(2)
  }

  const handleDexNext = () => {
    setStep(3)
  }

  const handleFinish = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-sigma-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sigma-green glow-text">SigmaV</h1>
          <p className="text-sigma-text-muted text-sm mt-1">Funding Rate Arbitrage Engine</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s < step ? 'bg-sigma-green text-sigma-bg' :
                s === step ? 'bg-sigma-green/20 text-sigma-green border border-sigma-green' :
                'bg-sigma-surface text-sigma-text-dim border border-sigma-border'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${s < step ? 'bg-sigma-green' : 'bg-sigma-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Connect Wallet */}
        {step === 1 && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sigma-green/10 border border-sigma-green/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-sigma-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-sigma-text mb-2">Connect Wallet</h2>
            <p className="text-sm text-sigma-text-muted mb-6">
              Connect your wallet to start using SigmaV&apos;s funding rate arbitrage engine.
            </p>
            <button
              onClick={handleConnect}
              className="w-full px-6 py-3 rounded-lg bg-sigma-green text-sigma-bg font-semibold hover:bg-sigma-green/90 transition-colors"
            >
              Connect Wallet
            </button>
            <p className="text-xs text-sigma-text-dim mt-3">Paper trading mode — no real funds required</p>
          </div>
        )}

        {/* Step 2: Connect DEXes */}
        {step === 2 && (
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-sigma-text mb-1 text-center">Connect DEXes</h2>
            <p className="text-sm text-sigma-text-muted mb-6 text-center">
              Select which decentralized exchanges to connect for rate comparison.
            </p>

            {/* GMX always on */}
            <div className="glass-card p-4 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sigma-green/20 flex items-center justify-center text-xs font-bold text-sigma-green">G</div>
                <div>
                  <p className="text-sm font-semibold text-sigma-text">GMX v2</p>
                  <p className="text-xs text-sigma-text-dim">Primary — Avalanche</p>
                </div>
              </div>
              <span className="text-xs text-sigma-green font-medium px-2 py-0.5 rounded bg-sigma-green/10 border border-sigma-green/20">Always On</span>
            </div>

            {SUPPORTED_DEXES.map((dex) => {
              const connected = wallet.connectedDexes.includes(dex)
              return (
                <button
                  key={dex}
                  onClick={() => wallet.toggleDex(dex)}
                  className={`w-full glass-card p-4 mb-3 flex items-center justify-between transition-colors ${
                    connected ? 'border-sigma-green/40' : 'border-sigma-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      connected ? 'bg-sigma-green/20 text-sigma-green' : 'bg-sigma-surface text-sigma-text-dim'
                    }`}>
                      {dex[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-sigma-text">{dex}</p>
                      <p className="text-xs text-sigma-text-dim">Perpetual DEX</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${connected ? 'bg-sigma-green' : 'bg-sigma-border'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${connected ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </button>
              )
            })}

            {wallet.address && (
              <p className="text-xs text-sigma-text-dim text-center mt-2 mb-4">
                Wallet: {truncateAddress(wallet.address)}
              </p>
            )}

            <button
              onClick={handleDexNext}
              disabled={wallet.connectedDexes.length === 0}
              className="w-full mt-4 px-6 py-3 rounded-lg bg-sigma-green text-sigma-bg font-semibold hover:bg-sigma-green/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Activate Pairs */}
        {step === 3 && (
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-sigma-text mb-1 text-center">Activate Pairs</h2>
            <p className="text-sm text-sigma-text-muted mb-6 text-center">
              Choose which DEX pairs to monitor for funding rate arbitrage.
            </p>

            {AVAILABLE_PAIRS.map((pair) => {
              const dexName = pair.split(' / ')[1]
              const dexConnected = wallet.connectedDexes.includes(dexName)
              const active = wallet.activePairs.includes(pair)

              return (
                <button
                  key={pair}
                  onClick={() => dexConnected && wallet.togglePair(pair)}
                  disabled={!dexConnected}
                  className={`w-full glass-card p-4 mb-3 flex items-center justify-between transition-colors ${
                    active ? 'border-sigma-green/40' : 'border-sigma-border'
                  } ${!dexConnected ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1`}>
                      <div className="w-7 h-7 rounded-full bg-sigma-green/20 flex items-center justify-center text-[10px] font-bold text-sigma-green">G</div>
                      <span className="text-sigma-text-dim text-xs">↔</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        active ? 'bg-sigma-green/20 text-sigma-green' : 'bg-sigma-surface text-sigma-text-dim'
                      }`}>
                        {dexName[0]}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-sigma-text">{pair}</p>
                      <p className="text-xs text-sigma-text-dim">
                        {dexConnected ? 'Cross-venue arbitrage' : `Connect ${dexName} first`}
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${active ? 'bg-sigma-green' : 'bg-sigma-border'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${active ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </button>
              )
            })}

            <button
              onClick={handleFinish}
              disabled={wallet.activePairs.length === 0}
              className="w-full mt-4 px-6 py-3 rounded-lg bg-sigma-green text-sigma-bg font-semibold hover:bg-sigma-green/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Launch Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
