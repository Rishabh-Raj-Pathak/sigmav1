export function formatUsd(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '$0.00'
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

export function formatRate(rate: number | undefined | null): string {
  if (rate == null || isNaN(rate)) return '0.0000%'
  if (Math.abs(rate) < 0.0001) {
    return `${(rate * 100).toFixed(6)}%`
  }
  return `${(rate * 100).toFixed(4)}%`
}

export function formatAnnualizedRate(rate: number | undefined | null): string {
  if (rate == null || isNaN(rate)) return '0.00%'
  return `${(rate * 100).toFixed(2)}%`
}

export function formatPnl(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '+$0.00'
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export function formatTimestamp(unix: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - unix

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`

  const date = new Date(unix * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function abbreviateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function rateToColor(rate: number): string {
  if (rate > 0.001) return 'text-sigma-green'
  if (rate > 0) return 'text-sigma-green-dim'
  if (rate < -0.001) return 'text-sigma-red'
  if (rate < 0) return 'text-sigma-red-dim'
  return 'text-sigma-text-dim'
}

export function rateToHeatmapColor(rate: number): string {
  const intensity = Math.min(Math.abs(rate) * 5000, 1)
  if (rate > 0) {
    return `rgba(0, 212, 170, ${0.1 + intensity * 0.7})`
  }
  if (rate < 0) {
    return `rgba(255, 71, 87, ${0.1 + intensity * 0.7})`
  }
  return 'rgba(122, 155, 140, 0.1)'
}
