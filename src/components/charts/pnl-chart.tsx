'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
  initialCapital?: number
}

const TIME_RANGES = [
  { label: '1D', hours: 24 },
  { label: '1W', hours: 168 },
  { label: '1M', hours: 720 },
  { label: 'All', hours: Infinity },
]

const MAX_CHART_POINTS = 250

function fmtDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function fmtDatetime(unix: number) {
  return new Date(unix * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr
  const step = (arr.length - 1) / (maxPoints - 1)
  return Array.from({ length: maxPoints }, (_, i) => arr[Math.round(i * step)])
}

export function PnlChart({ data, initialCapital }: PnlChartProps) {
  const [range, setRange] = useState('All')

  const sorted = useMemo(() => {
    const s = [...data].sort((a, b) => a.timestamp - b.timestamp)
    const sel = TIME_RANGES.find((r) => r.label === range)!
    const filtered = isFinite(sel.hours)
      ? s.filter((d) => d.timestamp >= Date.now() / 1000 - sel.hours * 3600)
      : s
    return downsample(filtered, MAX_CHART_POINTS)
  }, [data, range])

  const latestPnl = sorted.length ? sorted[sorted.length - 1].pnl : 0
  const firstPnl  = sorted.length ? sorted[0].pnl : 0
  const pnlDelta  = latestPnl - firstPnl

  // Use initial capital for % if available, else suppress for near-zero base
  const pct = (() => {
    if (initialCapital && initialCapital > 0) return (latestPnl / initialCapital) * 100
    if (Math.abs(firstPnl) >= 1) return (pnlDelta / Math.abs(firstPnl)) * 100
    return null
  })()

  const isUp      = latestPnl >= 0
  const accent    = isUp ? '#22c55e' : '#FF3B45'
  const accentRgb = isUp ? '34,197,94' : '255,59,69'
  const gradId    = isUp ? 'pnlGradUp' : 'pnlGradDn'

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-1.5"
            style={{ color: '#3a3a3a' }}
          >
            Cumulative P&amp;L
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-[22px] font-bold font-mono tracking-tight leading-none"
              style={{ color: accent }}
            >
              {isUp ? '+' : ''}{formatUsd(latestPnl)}
            </span>
            {pct !== null && Math.abs(pct) > 0.01 && (
              <span
                className="text-[11px] font-semibold font-mono"
                style={{ color: isUp ? 'rgba(34,197,94,0.7)' : 'rgba(255,59,69,0.7)' }}
              >
                {pct > 0 ? '+' : ''}{pct.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {/* Time range pills */}
        <div className="flex items-center gap-1 mt-0.5">
          {TIME_RANGES.map((r) => {
            const active = range === r.label
            return (
              <button
                key={r.label}
                onClick={() => setRange(r.label)}
                className="transition-all duration-150 active:scale-95"
                style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  padding: '3px 9px',
                  borderRadius: 99,
                  border: active
                    ? `1px solid rgba(${accentRgb},0.25)`
                    : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: active
                    ? `rgba(${accentRgb},0.08)`
                    : 'transparent',
                  color: active ? accent : '#444',
                  letterSpacing: '0.03em',
                  fontFamily: 'monospace',
                }}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div
          className="h-[200px] flex flex-col items-center justify-center gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#333' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-xs" style={{ color: '#3a3a3a' }}>No P&L history yet</p>
          <p className="text-[10px]" style={{ color: '#2a2a2a' }}>Data appears after the first cron tick</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={sorted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={accent} stopOpacity={0.15} />
                <stop offset="75%"  stopColor={accent} stopOpacity={0.03} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.03)"
              strokeDasharray="4 8"
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={fmtDate}
              tick={{ fill: '#3d3d3d', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              minTickGap={80}
            />
            <YAxis
              tickFormatter={(v: number) => formatUsd(v)}
              tick={{ fill: '#3d3d3d', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              width={62}
              tickCount={5}
            />

            {/* Zero baseline */}
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.07)"
              strokeDasharray="3 5"
            />

            <Tooltip
              cursor={{
                stroke: `rgba(${accentRgb},0.2)`,
                strokeWidth: 1,
                strokeDasharray: '3 4',
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as PnlPoint
                const up = item.pnl >= 0
                const c  = up ? '#22c55e' : '#FF3B45'
                return (
                  <div
                    style={{
                      background: 'rgba(8,8,8,0.95)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: `1px solid rgba(${accentRgb},0.18)`,
                      borderRadius: 12,
                      padding: '10px 14px',
                      minWidth: 164,
                      boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(${accentRgb},0.06)`,
                    }}
                  >
                    <p style={{ color: '#444', fontSize: 10, marginBottom: 7, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {fmtDatetime(item.timestamp)}
                    </p>
                    <p style={{ color: c, fontSize: 18, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: 7 }}>
                      {up ? '+' : ''}{formatUsd(item.pnl)}
                    </p>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 7, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <p style={{ color: '#3a3a3a', fontSize: 10, fontFamily: 'monospace' }}>
                        Funding{' '}
                        <span style={{ color: '#22c55e' }}>{formatUsd(item.funding)}</span>
                      </p>
                      {item.borrowing > 0 && (
                        <p style={{ color: '#3a3a3a', fontSize: 10, fontFamily: 'monospace' }}>
                          Borrowing{' '}
                          <span style={{ color: '#FF3B45' }}>−{formatUsd(item.borrowing)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              }}
            />

            <Area
              type="monotone"
              dataKey="pnl"
              stroke={accent}
              strokeWidth={1.5}
              fill={`url(#${gradId})`}
              baseValue={0}
              isAnimationActive={false}
              dot={false}
              activeDot={{
                r: 3.5,
                fill: accent,
                stroke: 'rgba(255,255,255,0.7)',
                strokeWidth: 1.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
