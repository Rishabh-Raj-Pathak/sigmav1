export interface FundingRateSnapshot {
  id?: number
  marketToken: string
  marketName: string
  indexToken: string
  tokenSymbol: string
  fundingRateLong: number
  fundingRateShort: number
  borrowingRateLong: number
  borrowingRateShort: number
  netRateLong: number
  netRateShort: number
  openInterestLong: number
  openInterestShort: number
  spotPrice: number | null
  timestamp: number
}

export interface SimulatedVenueRate {
  tokenSymbol: string
  venueName: string
  fundingRate: number
  annualizedRate: number
  timestamp: number
}

export interface Opportunity {
  id?: number
  tokenSymbol: string
  longVenue: string
  shortVenue: string
  fundingSpread: number
  entryPrice: number
  estimatedApr: number
  riskScore: number
  status: 'active' | 'expired' | 'taken'
  detectedAt: number
  expiredAt?: number
}

export interface PaperTrade {
  id?: number
  opportunityId?: number
  tokenSymbol: string
  direction: 'delta_neutral'
  longVenue?: string
  shortVenue?: string
  entryPrice: number
  currentPrice?: number
  positionSizeUsd: number
  leverage: number
  fundingCollected: number
  borrowingPaid: number
  unrealizedPnl: number
  realizedPnl?: number
  status: 'open' | 'closed' | 'liquidated'
  openedAt: number
  closedAt?: number
  closeReason?: string
}

export interface VaultSnapshot {
  id?: number
  totalValueUsd: number
  cashBalance: number
  positionsValue: number
  totalPnl: number
  cumulativeFunding: number
  numPositions: number
  utilizationPct: number
  timestamp: number
}

export interface StrategyConfig {
  minFundingSpread: number
  maxPositionSizeUsd: number
  maxTotalPositions: number
  maxPortfolioAllocation: number
  stopLossPct: number
  takeProfitPct: number
  rebalanceThreshold: number
  vaultInitialCapital: number
  updatedAt: number
}

export interface Signal {
  id?: number
  tokenSymbol: string
  signalType: 'entry' | 'exit' | 'rebalance'
  action: string
  reason: string
  fundingSpread?: number
  confidence?: number
  executed: boolean
  timestamp: number
}

export interface RebalanceEvent {
  id?: number
  action: 'open' | 'close' | 'adjust'
  tradeId?: number
  tokenSymbol: string
  reason: string
  oldSizeUsd?: number
  newSizeUsd?: number
  timestamp: number
}

export interface MarketData {
  marketToken: string
  marketName: string
  indexToken: string
  tokenSymbol: string
  isListed: boolean
  openInterestLong: number
  openInterestShort: number
  fundingRateLong: number
  fundingRateShort: number
  borrowingRateLong: number
  borrowingRateShort: number
  netRateLong: number
  netRateShort: number
  spotPrice: number
  availableLiquidityLong: number
  availableLiquidityShort: number
}

export interface VenueComparison {
  tokenSymbol: string
  venues: {
    name: string
    fundingRate: number
    annualizedRate: number
    isSimulated: boolean
  }[]
  maxSpread: number
  bestLong: string
  bestShort: string
}

export interface OpportunityWithAction extends Opportunity {
  canTakePosition: boolean
  reason?: string
}

export interface VaultState {
  totalValueUsd: number
  cashBalance: number
  positionsValue: number
  totalPnl: number
  cumulativeFunding: number
  numPositions: number
  utilizationPct: number
  positions: PaperTrade[]
  history: VaultSnapshot[]
}
