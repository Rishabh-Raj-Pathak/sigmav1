'use client'

import { useState } from 'react'
import { rateToHeatmapColor } from '@/lib/utils/formatting'
import { formatRate } from '@/lib/utils/formatting'

interface RateCell {
  time: number
  rate: number
}

interface HeatmapRow {
  tokenSymbol: string
  rates: RateCell[]
}

interface HeatmapProps {
  data: HeatmapRow[]
}

function formatHour(unix: number) {
  const d = new Date(unix * 1000)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function Heatmap({ data }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    token: string
    time: number
    rate: number
  } | null>(null)

  if (!data.length) return null

  const columnCount = data[0].rates.length

  return (
    <div className="relative">
      {/* Column headers (time labels) */}
      <div
        className="grid gap-px mb-1 pl-16"
        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
      >
        {data[0].rates.map((cell, i) => (
          <span
            key={i}
            className="text-[10px] text-sigma-text-muted text-center truncate"
          >
            {i % Math.max(1, Math.floor(columnCount / 6)) === 0
              ? formatHour(cell.time)
              : ''}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      {data.map((row) => (
        <div key={row.tokenSymbol} className="flex items-center gap-0 mb-px">
          <span className="w-16 shrink-0 text-xs text-sigma-text font-mono pr-2 text-right truncate">
            {row.tokenSymbol}
          </span>
          <div
            className="grid gap-px flex-1"
            style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
          >
            {row.rates.map((cell, i) => (
              <div
                key={i}
                className="aspect-square min-h-[14px] rounded-sm cursor-crosshair transition-opacity hover:opacity-80"
                style={{ backgroundColor: rateToHeatmapColor(cell.rate) }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const parent = e.currentTarget.closest('.relative')?.getBoundingClientRect()
                  if (parent) {
                    setTooltip({
                      x: rect.left - parent.left + rect.width / 2,
                      y: rect.top - parent.top - 4,
                      token: row.tokenSymbol,
                      time: cell.time,
                      rate: cell.rate,
                    })
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 pointer-events-none px-3 py-2 rounded-md text-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#111a16',
            border: '1px solid #1e3a2f',
            color: '#e8f0ec',
          }}
        >
          <p className="font-semibold">{tooltip.token}</p>
          <p className="text-sigma-text-dim">{formatHour(tooltip.time)}</p>
          <p style={{ color: tooltip.rate >= 0 ? '#00d4aa' : '#ff4757' }}>
            {formatRate(tooltip.rate)}
          </p>
        </div>
      )}
    </div>
  )
}
