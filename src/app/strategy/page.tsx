'use client'

import { StrategyConfig } from '@/components/strategy/strategy-config'
import { SignalLog } from '@/components/strategy/signal-log'
import { Card } from '@/components/ui/card'

export default function StrategyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-sigma-text glow-text">Strategy</h2>
        <p className="text-sm text-sigma-text-muted mt-1">Configure arbitrage parameters & view signal history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrategyConfig />
        <div className="space-y-6">
          <SignalLog />
          <Card title="Backtest Summary" subtitle="Historical strategy performance">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-sigma-bg/50">
                <p className="text-2xl font-bold font-mono text-sigma-green">67.3%</p>
                <p className="text-xs text-sigma-text-muted mt-1">Win Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-sigma-bg/50">
                <p className="text-2xl font-bold font-mono text-sigma-green">1.84</p>
                <p className="text-xs text-sigma-text-muted mt-1">Sharpe Ratio</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-sigma-bg/50">
                <p className="text-2xl font-bold font-mono text-sigma-green">+12.4%</p>
                <p className="text-xs text-sigma-text-muted mt-1">Avg Return</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-sigma-bg/50">
                <p className="text-2xl font-bold font-mono text-sigma-red">-3.2%</p>
                <p className="text-xs text-sigma-text-muted mt-1">Max Drawdown</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
