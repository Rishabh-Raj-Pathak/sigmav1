'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatRate, formatAnnualizedRate } from '@/lib/utils/formatting'

interface SpreadPoint {
  tokenSymbol: string
  spread: number
  estimatedApr: number
}

interface SpreadChartProps {
  data: SpreadPoint[]
}

export function SpreadChart({ data }: SpreadChartProps) {
  const sorted = [...data].sort((a, b) => b.spread - a.spread)

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 36 + 40)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
      >
        <XAxis
          type="number"
          tickFormatter={(v: number) => formatRate(v)}
          tick={{ fill: '#7a9b8c', fontSize: 11 }}
          axisLine={{ stroke: '#1e3a2f' }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="tokenSymbol"
          tick={{ fill: '#e8f0ec', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <ReferenceLine x={0.0001} stroke="#ffa502" strokeDasharray="4 2" label={{
          value: 'Threshold',
          fill: '#ffa502',
          fontSize: 10,
          position: 'top',
        }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111a16',
            border: '1px solid #1e3a2f',
            borderRadius: 6,
            fontSize: 12,
            color: '#e8f0ec',
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => {
            if (name === 'spread') return [formatRate(Number(value)), 'Spread']
            return [value]
          }}
          labelFormatter={(label: unknown) => String(label)}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as SpreadPoint
            return (
              <div style={{
                backgroundColor: '#111a16',
                border: '1px solid #1e3a2f',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 12,
                color: '#e8f0ec',
              }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.tokenSymbol}</p>
                <p>Spread: {formatRate(item.spread)}</p>
                <p>Est. APR: {formatAnnualizedRate(item.estimatedApr)}</p>
              </div>
            )
          }}
        />
        <Bar dataKey="spread" radius={[0, 4, 4, 0]} barSize={20}>
          {sorted.map((entry, i) => (
            <Cell key={i} fill={entry.spread > 0 ? '#00d4aa' : '#ff4757'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
