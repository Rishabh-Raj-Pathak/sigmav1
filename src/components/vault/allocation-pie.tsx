'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/ui/skeleton'
import { useVault } from '@/lib/hooks/use-vault'
import { formatUsd } from '@/lib/utils/formatting'

const PIE_COLORS = [
  '#00d4aa', // sigma-green
  '#00a888',
  '#2d5a47',
  '#f0b429', // sigma-amber
  '#e06b50',
  '#7a9b8c',
  '#4fc3f7',
  '#ab47bc',
]

interface AllocationEntry {
  name: string
  value: number
}

export function AllocationPie() {
  const { data: vault, isLoading } = useVault()

  const positions = vault?.positions?.filter((p) => p.status === 'open') ?? []

  const allocationMap = new Map<string, number>()
  for (const pos of positions) {
    const current = allocationMap.get(pos.tokenSymbol) ?? 0
    allocationMap.set(pos.tokenSymbol, current + pos.positionSizeUsd)
  }

  if (vault && vault.cashBalance > 0) {
    allocationMap.set('Cash', vault.cashBalance)
  }

  const data: AllocationEntry[] = Array.from(allocationMap.entries()).map(
    ([name, value]) => ({ name, value })
  )

  return (
    <Card title="Allocation" subtitle="Portfolio breakdown by token">
      {isLoading ? (
        <ChartSkeleton />
      ) : !data.length ? (
        <div className="flex items-center justify-center h-64 text-sm text-sigma-text-muted">
          No allocations to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 25, 20, 0.95)',
                border: '1px solid rgba(0, 212, 170, 0.2)',
                borderRadius: '8px',
                color: '#e0ebe5',
                fontSize: '12px',
              }}
              formatter={(value: unknown) => formatUsd(Number(value))}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-sigma-text-dim">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
