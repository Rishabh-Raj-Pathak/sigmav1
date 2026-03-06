'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/data-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { usePolling } from '@/lib/hooks/use-polling'
import { formatUsd, formatPnl, formatTimestamp } from '@/lib/utils/formatting'
import type { PaperTrade } from '@/lib/utils/types'

interface TradeLeg {
  tradeId: number | undefined
  tokenSymbol: string
  leg: 'Long' | 'Short'
  venue: string
  entryPrice: number
  positionSizeUsd: number
  pnl: number
  status: 'open' | 'closed' | 'liquidated'
  openedAt: number
}

function expandToLegs(trades: PaperTrade[]): (TradeLeg & Record<string, unknown>)[] {
  const rows: (TradeLeg & Record<string, unknown>)[] = []
  for (const trade of trades) {
    const pnl = trade.status === 'closed' ? (trade.realizedPnl ?? 0) : trade.unrealizedPnl
    const halfSize = trade.positionSizeUsd / 2

    rows.push({
      tradeId: trade.id,
      tokenSymbol: trade.tokenSymbol,
      leg: 'Long',
      venue: trade.longVenue || 'GMX',
      entryPrice: trade.entryPrice,
      positionSizeUsd: halfSize,
      pnl: pnl / 2,
      status: trade.status,
      openedAt: trade.openedAt,
    })
    rows.push({
      tradeId: trade.id,
      tokenSymbol: trade.tokenSymbol,
      leg: 'Short',
      venue: trade.shortVenue || 'GMX',
      entryPrice: trade.entryPrice,
      positionSizeUsd: halfSize,
      pnl: pnl / 2,
      status: trade.status,
      openedAt: trade.openedAt,
    })
  }
  return rows
}

const columns: Column<TradeLeg & Record<string, unknown>>[] = [
  {
    key: 'tokenSymbol',
    label: 'Token',
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-sigma-text">{row.tokenSymbol}</span>
    ),
  },
  {
    key: 'leg',
    label: 'Side',
    render: (row) => (
      <Badge variant={row.leg === 'Long' ? 'green' : 'red'}>
        {row.leg}
      </Badge>
    ),
  },
  {
    key: 'venue',
    label: 'Venue',
    render: (row) => (
      <span className="text-sigma-text-dim text-xs">{row.venue}</span>
    ),
  },
  {
    key: 'entryPrice',
    label: 'Entry',
    sortable: true,
    align: 'right',
    render: (row) => formatUsd(row.entryPrice),
  },
  {
    key: 'positionSizeUsd',
    label: 'Size',
    sortable: true,
    align: 'right',
    render: (row) => formatUsd(row.positionSizeUsd),
  },
  {
    key: 'pnl',
    label: 'PnL',
    sortable: true,
    align: 'right',
    render: (row) => (
      <span className={row.pnl >= 0 ? 'text-sigma-green' : 'text-sigma-red'}>
        {formatPnl(row.pnl)}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => {
      const variant = row.status === 'open' ? 'green' : row.status === 'closed' ? 'neutral' : 'red'
      return <Badge variant={variant}>{row.status}</Badge>
    },
  },
  {
    key: 'openedAt',
    label: 'Opened',
    sortable: true,
    render: (row) => (
      <span className="text-sigma-text-dim">{formatTimestamp(row.openedAt)}</span>
    ),
  },
]

export function RecentTrades() {
  const { data: trades, isLoading } = usePolling<PaperTrade[]>('/api/paper-trade')
  const legs = expandToLegs(trades ?? [])

  return (
    <Card title="Recent Trades" subtitle="Paper trading history">
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <DataTable
          columns={columns}
          data={legs}
          emptyMessage="No trades yet"
        />
      )}
    </Card>
  )
}
