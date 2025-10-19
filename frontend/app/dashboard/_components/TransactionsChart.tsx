'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { TransactionChartData } from '@/types/chart'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface TransactionsChartProps {
  data: TransactionChartData[]
  loading?: boolean
}

export function TransactionsChart({ data, loading }: TransactionsChartProps) {
  const [chartColors, setChartColors] = useState({
    border: '#e4e7ec',
    muted: '#6b7280',
    brand: '#4F46E5',
    cardBg: '#ffffff'
  })

  useEffect(() => {
    // Get CSS variables for dynamic theme colors
    const root = document.documentElement
    const styles = getComputedStyle(root)

    setChartColors({
      border: styles.getPropertyValue('--border').trim() || '#e4e7ec',
      muted: styles.getPropertyValue('--fg-muted').trim() || '#6b7280',
      brand: styles.getPropertyValue('--brand').trim() || '#4F46E5',
      cardBg: styles.getPropertyValue('--card').trim() || '#ffffff'
    })
  }, [])

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-surface rounded-2xl animate-pulse flex items-center justify-center">
        <p className="font-mono text-base text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-surface rounded-2xl flex items-center justify-center">
        <p className="font-mono text-base text-muted-foreground">No data available</p>
      </div>
    )
  }

  const totalVolume = data.reduce((sum, item) => sum + item.volume, 0)
  const totalVolumeUSD = data.reduce((sum, item) => sum + item.volumeUSD, 0)
  const avgDaily = totalVolume / data.length
  const lastVolume = data[data.length - 1]?.volume || 0
  const prevVolume = data[data.length - 2]?.volume || lastVolume
  const dailyChange = prevVolume > 0 ? ((lastVolume - prevVolume) / prevVolume) * 100 : 0

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TransactionChartData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-brand/20">
          <p className="font-mono text-xs text-muted-foreground mb-1">
            {new Date(data.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <p className="font-display text-xl text-brand mb-1">
            ${data.volumeUSD.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} USD
          </p>
          <p className="font-mono text-xs text-muted-foreground mb-1">
            ~{data.volume.toFixed(2)} SOL
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {data.count} transactions
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      {/* Modern Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between gap-8">
          {/* Left side - Icon and Title */}
          <div className="flex items-center gap-4">
            {/* Icon container */}
            <div className="shrink-0 w-12 h-12 rounded-xl bg-brand/5 border-2 border-brand/10 flex items-center justify-center">
              <Image
                src="/chart-line.png"
                alt="Chart"
                width={28}
                height={28}
                className="pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Title and subtitle */}
            <div className="flex flex-col justify-center">
              <h3 className="font-sans text-xl font-semibold text-foreground m-0 p-0 leading-none">
                Transaction Volume
              </h3>
              <p className="font-mono text-xs text-muted-foreground m-0 p-0 mt-1.5 leading-none">
                Total revenue in period
              </p>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="shrink-0 flex flex-col items-end justify-center">
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-3xl font-bold text-success leading-none">
                ${(totalVolumeUSD / 1000).toFixed(1)}k
              </span>
              <span className="font-mono text-xs text-muted-foreground leading-none">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartColors.border}
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            }}
            tick={{ fill: chartColors.muted, fontSize: 11, fontFamily: 'var(--font-dm-mono)' }}
            stroke={chartColors.border}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: chartColors.muted, fontSize: 11, fontFamily: 'var(--font-dm-mono)' }}
            stroke={chartColors.border}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartColors.brand, strokeWidth: 2, strokeDasharray: '5 5' }} />
          <Line
            type="monotone"
            dataKey="volume"
            stroke={chartColors.brand}
            strokeWidth={3}
            dot={{ fill: chartColors.brand, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: chartColors.brand, stroke: chartColors.cardBg, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
