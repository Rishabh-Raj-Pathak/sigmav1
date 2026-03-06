import type { PaperTrade, StrategyConfig, VaultSnapshot } from '../utils/types'

export function checkRiskLimits(
  vault: VaultSnapshot,
  proposedSizeUsd: number,
  openTrades: PaperTrade[],
  config: StrategyConfig
): { allowed: boolean; reason?: string } {
  if (openTrades.filter((t) => t.status === 'open').length >= config.maxTotalPositions) {
    return { allowed: false, reason: `Max positions reached (${config.maxTotalPositions})` }
  }

  if (proposedSizeUsd > vault.cashBalance) {
    return { allowed: false, reason: `Insufficient cash ($${vault.cashBalance.toFixed(0)} available, $${proposedSizeUsd.toFixed(0)} needed)` }
  }

  const newUtilization = (vault.positionsValue + proposedSizeUsd) / vault.totalValueUsd
  if (newUtilization > 0.9) {
    return { allowed: false, reason: `Would exceed 90% utilization (${(newUtilization * 100).toFixed(1)}%)` }
  }

  const positionAllocation = proposedSizeUsd / vault.totalValueUsd
  if (positionAllocation > config.maxPortfolioAllocation) {
    return {
      allowed: false,
      reason: `Position too large (${(positionAllocation * 100).toFixed(1)}% > ${(config.maxPortfolioAllocation * 100).toFixed(0)}% max)`,
    }
  }

  return { allowed: true }
}

export function calculateOptimalSize(
  vault: VaultSnapshot,
  estimatedApr: number,
  riskScore: number,
  config: StrategyConfig
): number {
  const confidenceFactor = Math.max(0.3, 1 - riskScore / 100)
  const aprFactor = Math.min(1, estimatedApr / 0.2)

  const maxByAllocation = vault.totalValueUsd * config.maxPortfolioAllocation
  const maxByConfig = config.maxPositionSizeUsd
  const maxByCash = vault.cashBalance * 0.9

  const ceiling = Math.min(maxByAllocation, maxByConfig, maxByCash)
  const optimal = ceiling * confidenceFactor * aprFactor
  const result = Math.max(1000, Math.round(optimal / 100) * 100)

  return isFinite(result) ? result : 1000
}
