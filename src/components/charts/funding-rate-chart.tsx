'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatRate } from '@/lib/utils/formatting'

const VENUE_COLORS = ['#00d4aa', '#ffa502', '#ff4757', '#00a888', '#cc3945']

interface FundingRatePoint {
  timestamp: number
  rate: number
  venue: string
}

interface FundingRateChartProps {
  data: FundingRatePoint[]
  title: string
}

function formatTime(unix: number) {
  const d = new Date(unix * 1000)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function FundingRateChart({ data, title }: FundingRateChartProps) {
  const venues = [...new Set(data.map((d) => d.venue))]

  // Pivot data: group by timestamp, spread venues into columns
  const grouped = new Map<number, Record<string, number | undefined>>()
  for (const point of data) {
    if (!grouped.has(point.timestamp)) {
      grouped.set(point.timestamp, { timestamp: point.timestamp })
    }
    grouped.get(point.timestamp)![point.venue] = point.rate
  }
  const chartData = Array.from(grouped.values()).sort(
    (a, b) => (a.timestamp as number) - (b.timestamp as number)
  )

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-sigma-text mb-3">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fill: '#7a9b8c', fontSize: 11 }}
            axisLine={{ stroke: '#1e3a2f' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatRate(v)}
            tick={{ fill: '#7a9b8c', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={72}
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
            formatter={(value: unknown) => [formatRate(Number(value))]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#7a9b8c' }}
          />
          {venues.map((venue, i) => (
            <Line
              key={venue}
              type="monotone"
              dataKey={venue}
              stroke={VENUE_COLORS[i % VENUE_COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
