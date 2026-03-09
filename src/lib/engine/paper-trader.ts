import type { PaperTrade, Opportunity, StrategyConfig } from '../utils/types'

export function openDeltaNeutralPosition(
  opportunity: Opportunity,
  spotPrice: number,
  positionSizeUsd: number
): PaperTrade {
  return {
    opportunityId: opportunity.id,
    tokenSymbol: opportunity.tokenSymbol,
    direction: 'delta_neutral',
    longVenue: opportunity.longVenue,
    shortVenue: opportunity.shortVenue,
    entryPrice: spotPrice,
    currentPrice: spotPrice,
    positionSizeUsd,
    leverage: 1.0,
    fundingCollected: 0,
    borrowingPaid: 0,
    unrealizedPnl: 0,
    status: 'open',
    openedAt: Math.floor(Date.now() / 1000),
  }
}

export function updatePositionState(
  trade: PaperTrade,
  currentPrice: number,
  fundingRateHourly: number,
  borrowingRateHourly: number,
  elapsedHours: number
): PaperTrade {
  const fundingEarned = Math.abs(fundingRateHourly) * trade.positionSizeUsd * elapsedHours
  const borrowingCost = Math.abs(borrowingRateHourly) * trade.positionSizeUsd * elapsedHours

  const newFundingCollected = trade.fundingCollected + fundingEarned
  const newBorrowingPaid = trade.borrowingPaid + borrowingCost

  // Delta-neutral: net P&L is funding income minus borrowing cost
  const unrealizedPnl = newFundingCollected - newBorrowingPaid

  return {
    ...trade,
    currentPrice,
    fundingCollected: newFundingCollected,
    borrowingPaid: newBorrowingPaid,
    unrealizedPnl,
  }
}

export function closePosition(
  trade: PaperTrade,
  currentPrice: number,
  reason: string
): { realizedPnl: number; trade: PaperTrade } {
  const realizedPnl = trade.fundingCollected - trade.borrowingPaid
  const closedTrade: PaperTrade = {
    ...trade,
    currentPrice,
    realizedPnl,
    unrealizedPnl: 0,
    status: 'closed',
    closedAt: Math.floor(Date.now() / 1000),
    closeReason: reason,
  }

  return { realizedPnl, trade: closedTrade }
}

export function calculatePositionSize(
  vaultCashBalance: number,
  config: StrategyConfig,
  confidence: number
): number {
  const maxByAllocation = vaultCashBalance * config.maxPortfolioAllocation
  const maxByConfig = config.maxPositionSizeUsd
  const confidenceAdjusted = Math.min(maxByAllocation, maxByConfig) * Math.max(confidence, 0.5)
  return Math.max(1000, Math.round(confidenceAdjusted / 100) * 100)
}
