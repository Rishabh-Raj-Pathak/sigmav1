'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatUsd } from '@/lib/utils/formatting'

interface PnlPoint {
  timestamp: number
  pnl: number
  funding: number
  borrowing: number
}

interface PnlChartProps {
  data: PnlPoint[]
}

function formatTime(unix: number) {
  const d = new Date(unix * 1000)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function PnlChart({ data }: PnlChartProps) {
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={sorted} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id="pnlGradientPos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#00d4aa" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="pnlGradientNeg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4757" stopOpacity={0.02} />
            <stop offset="100%" stopColor="#ff4757" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatTime}
          tick={{ fill: '#7a9b8c', fontSize: 11 }}
          axisLine={{ stroke: '#1e3a2f' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatUsd(v)}
          tick={{ fill: '#7a9b8c', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <ReferenceLine y={0} stroke="#1e3a2f" strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111a16',
            border: '1px solid #1e3a2f',
            borderRadius: 6,
            fontSize: 12,
            color: '#e8f0ec',
          }}
          labelFormatter={(v: unknown) => formatTime(Number(v))}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as PnlPoint
            return (
              <div style={{
                backgroundColor: '#111a16',
                border: '1px solid #1e3a2f',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 12,
                color: '#e8f0ec',
              }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{formatTime(item.timestamp)}</p>
                <p style={{ color: item.pnl >= 0 ? '#00d4aa' : '#ff4757' }}>
                  P&L: {formatUsd(item.pnl)}
                </p>
                <p>Funding: {formatUsd(item.funding)}</p>
                <p>Borrowing: {formatUsd(item.borrowing)}</p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="pnl"
          stroke="#00d4aa"
          strokeWidth={1.5}
          fill="url(#pnlGradientPos)"
          baseValue={0}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
