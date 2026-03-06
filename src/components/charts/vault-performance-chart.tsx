'use client'

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatUsd } from '@/lib/utils/formatting'

interface VaultPoint {
  timestamp: number
  totalValueUsd: number
  cumulativeFunding: number
}

interface VaultPerformanceChartProps {
  data: VaultPoint[]
}

function formatDate(unix: number) {
  const d = new Date(unix * 1000)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const INITIAL_CAPITAL = 100_000

export function VaultPerformanceChart({ data }: VaultPerformanceChartProps) {
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={sorted} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00d4aa" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatDate}
          tick={{ fill: '#7a9b8c', fontSize: 11 }}
          axisLine={{ stroke: '#1e3a2f' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatUsd(v)}
          tick={{ fill: '#7a9b8c', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={72}
          domain={['auto', 'auto']}
        />
        <ReferenceLine
          y={INITIAL_CAPITAL}
          stroke="#ffa502"
          strokeDasharray="4 2"
          label={{
            value: 'Initial',
            fill: '#ffa502',
            fontSize: 10,
            position: 'right',
          }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as VaultPoint
            const pnl = item.totalValueUsd - INITIAL_CAPITAL
            return (
              <div style={{
                backgroundColor: '#111a16',
                border: '1px solid #1e3a2f',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 12,
                color: '#e8f0ec',
              }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{formatDate(item.timestamp)}</p>
                <p>NAV: {formatUsd(item.totalValueUsd)}</p>
                <p style={{ color: pnl >= 0 ? '#00d4aa' : '#ff4757' }}>
                  P&L: {formatUsd(pnl)}
                </p>
                <p>Funding: {formatUsd(item.cumulativeFunding)}</p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="totalValueUsd"
          stroke="#00d4aa"
          strokeWidth={1.5}
          fill="url(#navGradient)"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
