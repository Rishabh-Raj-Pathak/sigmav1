'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/data-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { usePolling } from '@/lib/hooks/use-polling'
import { formatUsd, formatPnl, formatTimestamp } from '@/lib/utils/formatting'
import type { PaperTrade } from '@/lib/utils/types'

const columns: Column<PaperTrade & Record<string, unknown>>[] = [
  {
    key: 'tokenSymbol',
    label: 'Token',
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-sigma-text">{row.tokenSymbol}</span>
    ),
  },
  {
    key: 'entryPrice',
    label: 'Entry Price',
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
    key: 'unrealizedPnl',
    label: 'PnL',
    sortable: true,
    align: 'right',
    render: (row) => {
      const pnl = row.status === 'closed' ? (row.realizedPnl ?? 0) : row.unrealizedPnl
      return (
        <span className={pnl >= 0 ? 'text-sigma-green' : 'text-sigma-red'}>
          {formatPnl(pnl)}
        </span>
      )
    },
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

  return (
    <Card title="Recent Trades" subtitle="Paper trading history">
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <DataTable
          columns={columns}
          data={(trades ?? []) as (PaperTrade & Record<string, unknown>)[]}
          emptyMessage="No trades yet"
        />
      )}
    </Card>
  )
}
