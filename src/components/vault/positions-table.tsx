'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useVault } from '@/lib/hooks/use-vault'
import { formatUsd, formatPnl } from '@/lib/utils/formatting'
import type { PaperTrade } from '@/lib/utils/types'

type Row = PaperTrade & Record<string, unknown>

function durationStr(openedAt: number): string {
  const secs = Math.floor(Date.now() / 1000) - openedAt
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  return `${Math.floor(secs / 86400)}d`
}

export function PositionsTable() {
  const { data: vault, isLoading } = useVault()
  const [closingId, setClosingId] = useState<number | null>(null)

  const handleClose = async (id: number) => {
    setClosingId(id)
    try {
      const res = await fetch(`/api/paper-trade/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to close position')
      await mutate('/api/vault')
    } catch (err) {
      console.error('Close position failed:', err)
    } finally {
      setClosingId(null)
    }
  }

  const columns: Column<Row>[] = [
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
      label: 'Entry',
      sortable: true,
      align: 'right',
      render: (row) => formatUsd(row.entryPrice),
    },
    {
      key: 'currentPrice',
      label: 'Current',
      align: 'right',
      render: (row) => formatUsd(row.currentPrice ?? row.entryPrice),
    },
    {
      key: 'positionSizeUsd',
      label: 'Size',
      sortable: true,
      align: 'right',
      render: (row) => formatUsd(row.positionSizeUsd),
    },
    {
      key: 'fundingCollected',
      label: 'Funding Earned',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="text-sigma-green">{formatPnl(row.fundingCollected)}</span>
      ),
    },
    {
      key: 'borrowingPaid',
      label: 'Borrowing Paid',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="text-sigma-red">{formatPnl(-row.borrowingPaid)}</span>
      ),
    },
    {
      key: 'unrealizedPnl',
      label: 'Net PnL',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className={row.unrealizedPnl >= 0 ? 'text-sigma-green' : 'text-sigma-red'}>
          {formatPnl(row.unrealizedPnl)}
        </span>
      ),
    },
    {
      key: 'openedAt',
      label: 'Duration',
      sortable: true,
      render: (row) => (
        <span className="text-sigma-text-dim">{durationStr(row.openedAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (row.id != null) handleClose(row.id)
          }}
          disabled={closingId === row.id}
          className="px-2 py-1 text-xs font-medium rounded-lg bg-sigma-red/10 text-sigma-red border border-sigma-red/20 hover:bg-sigma-red/20 transition-colors disabled:opacity-40"
        >
          {closingId === row.id ? 'Closing...' : 'Close'}
        </button>
      ),
    },
  ]

  const openPositions = (vault?.positions ?? []).filter((p) => p.status === 'open')

  return (
    <Card title="Open Positions" subtitle={`${openPositions.length} active`}>
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <DataTable
          columns={columns}
          data={openPositions as Row[]}
          emptyMessage="No open positions"
        />
      )}
    </Card>
  )
}
