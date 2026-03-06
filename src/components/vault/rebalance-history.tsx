'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTimestamp } from '@/lib/utils/formatting'
import type { RebalanceEvent } from '@/lib/utils/types'

export function RebalanceHistory() {
  const [events, setEvents] = useState<RebalanceEvent[]>([])
  const [isTriggering, setIsTriggering] = useState(false)

  const handleRebalance = async () => {
    setIsTriggering(true)
    try {
      const res = await fetch('/api/vault/rebalance', { method: 'POST' })
      if (!res.ok) throw new Error('Rebalance failed')
      const data = await res.json()
      const newEvents = Array.isArray(data.events) ? data.events : data.event ? [data.event] : []
      setEvents((prev) => [...newEvents, ...prev])
      await mutate('/api/vault')
    } catch (err) {
      console.error('Rebalance failed:', err)
    } finally {
      setIsTriggering(false)
    }
  }

  const actionVariant = (action: string) => {
    if (action === 'open') return 'green' as const
    if (action === 'close') return 'red' as const
    return 'amber' as const
  }

  return (
    <Card
      title="Rebalance"
      subtitle="Portfolio rebalancing actions"
      headerRight={
        <button
          onClick={handleRebalance}
          disabled={isTriggering}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sigma-green/10 text-sigma-green border border-sigma-green/20 hover:bg-sigma-green/20 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${isTriggering ? 'animate-spin' : ''}`} />
          {isTriggering ? 'Running...' : 'Trigger Rebalance'}
        </button>
      }
    >
      {!events.length ? (
        <p className="text-sm text-sigma-text-muted text-center py-6">
          No rebalance events yet. Click &ldquo;Trigger Rebalance&rdquo; to run.
        </p>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
          {events.map((evt, i) => (
            <div key={evt.id ?? i} className="glass-card p-3 flex items-start gap-3">
              <Badge variant={actionVariant(evt.action)}>{evt.action}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sigma-text font-medium">{evt.tokenSymbol}</p>
                <p className="text-xs text-sigma-text-dim mt-0.5">{evt.reason}</p>
              </div>
              <span className="text-xs text-sigma-text-muted whitespace-nowrap">
                {formatTimestamp(evt.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
