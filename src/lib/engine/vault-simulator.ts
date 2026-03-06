import type { PaperTrade, VaultSnapshot, StrategyConfig, RebalanceEvent } from '../utils/types'

function safeNum(v: number): number {
  return (v != null && isFinite(v)) ? v : 0
}

export function computeVaultState(
  initialCapital: number,
  openTrades: PaperTrade[],
  closedTradesRealizedPnl: number
): VaultSnapshot {
  const capital = safeNum(initialCapital)
  const closedPnl = safeNum(closedTradesRealizedPnl)

  const positionsValue = openTrades.reduce(
    (sum, t) => sum + safeNum(t.positionSizeUsd) + safeNum(t.unrealizedPnl),
    0
  )
  const totalDeployed = openTrades.reduce((sum, t) => sum + safeNum(t.positionSizeUsd), 0)
  const cashBalance = capital - totalDeployed + closedPnl
  const totalValueUsd = cashBalance + positionsValue
  const totalPnl = totalValueUsd - capital
  const cumulativeFunding = openTrades.reduce((sum, t) => sum + safeNum(t.fundingCollected), 0)
  const utilizationPct = capital > 0 ? totalDeployed / capital : 0

  return {
    totalValueUsd: safeNum(totalValueUsd),
    cashBalance: safeNum(cashBalance),
    positionsValue: safeNum(positionsValue),
    totalPnl: safeNum(totalPnl),
    cumulativeFunding: safeNum(cumulativeFunding),
    numPositions: openTrades.length,
    utilizationPct: safeNum(utilizationPct),
    timestamp: Math.floor(Date.now() / 1000),
  }
}

export function checkRebalanceNeeded(
  openTrades: PaperTrade[],
  vaultTotalValue: number,
  config: StrategyConfig
): RebalanceEvent[] {
  const events: RebalanceEvent[] = []

  for (const trade of openTrades) {
    const currentAllocation = (trade.positionSizeUsd + trade.unrealizedPnl) / vaultTotalValue
    const drift = Math.abs(currentAllocation - config.maxPortfolioAllocation)

    if (drift > config.rebalanceThreshold && currentAllocation > config.maxPortfolioAllocation) {
      const targetSize = vaultTotalValue * config.maxPortfolioAllocation
      events.push({
        action: 'adjust',
        tradeId: trade.id,
        tokenSymbol: trade.tokenSymbol,
        reason: `Position exceeds ${(config.maxPortfolioAllocation * 100).toFixed(0)}% allocation (current: ${(currentAllocation * 100).toFixed(1)}%)`,
        oldSizeUsd: trade.positionSizeUsd,
        newSizeUsd: targetSize,
        timestamp: Math.floor(Date.now() / 1000),
      })
    }

    const pnlPct = trade.unrealizedPnl / trade.positionSizeUsd
    if (pnlPct <= -config.stopLossPct) {
      events.push({
        action: 'close',
        tradeId: trade.id,
        tokenSymbol: trade.tokenSymbol,
        reason: `Stop loss triggered (${(pnlPct * 100).toFixed(2)}%)`,
        oldSizeUsd: trade.positionSizeUsd,
        newSizeUsd: 0,
        timestamp: Math.floor(Date.now() / 1000),
      })
    }
  }

  return events
}
