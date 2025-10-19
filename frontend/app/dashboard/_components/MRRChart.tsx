'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { MRRChartData } from '@/types/chart'
import Image from 'next/image'

interface MRRChartProps {
  data: MRRChartData[]
  loading?: boolean
}

export function MRRChart({ data, loading }: MRRChartProps) {
  if (loading) {
    return (
      <div className="w-full h-[400px] bg-surface rounded-2xl animate-pulse flex items-center justify-center">
        <p className="font-mono text-base text-muted">Loading...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-surface rounded-2xl flex items-center justify-center">
        <p className="font-mono text-base text-muted">No data available</p>
      </div>
    )
  }

  const lastValue = data[data.length - 1]?.mrr || 0
  const lastValueUSD = data[data.length - 1]?.mrrUSD || 0
  const firstValue = data[0]?.mrr || 0
  const growthPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: MRRChartData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-surface/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-[#F2B94B]/20">
          <p className="font-mono text-xs text-muted mb-1">
            {new Date(data.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <p className="font-display text-xl text-[#F2B94B] mb-1">
            ${data.mrrUSD.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} USD
          </p>
          <p className="font-mono text-xs text-muted">
            ~{data.mrr.toFixed(2)} SOL
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border">
      {/* Modern Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between gap-8">
          {/* Left side - Icon and Title */}
          <div className="flex items-center gap-4">
            {/* Icon container */}
            <div className="shrink-0 w-12 h-12 rounded-xl bg-[#F2B94B]/5 border-2 border-[#F2B94B]/10 flex items-center justify-center">
              <Image
                src="/money.png"
                alt="Money"
                width={28}
                height={28}
                className="pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Title and subtitle */}
            <div className="flex flex-col justify-center">
              <h3 className="font-sans text-xl font-semibold text-foreground m-0 p-0 leading-none">
                MRR
              </h3>
              <p className="font-mono text-xs text-muted m-0 p-0 mt-1.5 leading-none">
                Monthly Recurring Revenue
              </p>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="shrink-0 flex flex-col items-end justify-center">
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-3xl font-bold text-[#10b981] leading-none">
                ${(lastValueUSD / 1000).toFixed(1)}k
              </span>
              <span className="font-mono text-xs text-muted leading-none">USD/mo</span>
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
            stroke="#e4e7ec"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            }}
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'var(--font-dm-mono)' }}
            stroke="#e4e7ec"
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'var(--font-dm-mono)' }}
            stroke="#e4e7ec"
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F2B94B', strokeWidth: 2, strokeDasharray: '5 5' }} />
          <Line
            type="monotone"
            dataKey="mrr"
            stroke="#F2B94B"
            strokeWidth={3}
            dot={{ fill: '#F2B94B', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#F2B94B', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
