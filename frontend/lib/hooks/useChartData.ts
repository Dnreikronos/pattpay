'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TransactionChartData, MRRChartData, ChartPeriod } from '@/types/chart'

interface ChartDataState {
  transactions: TransactionChartData[]
  mrr: MRRChartData[]
  loading: boolean
  error: string | null
}

// Generate mock transaction data
function generateTransactionData(period: ChartPeriod): TransactionChartData[] {
  let days = 7
  if (period === '30d') days = 30
  if (period === '90d') days = 90

  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))

    // Generate realistic transaction volume
    const baseVolume = 150 // Base volume in SOL
    const randomVariation = Math.random() * 100 - 50
    const volume = baseVolume + randomVariation

    const solToUSD = 100 // Mock SOL price
    const volumeUSD = volume * solToUSD

    // Number of transactions
    const baseCount = 45
    const countVariation = Math.floor(Math.random() * 30) - 15
    const count = Math.max(baseCount + countVariation, 10)

    const previousVolume = i === 0 ? baseVolume : baseVolume + (Math.random() * 100 - 50)
    const change = ((volume - previousVolume) / previousVolume) * 100

    return {
      date: date.toISOString().split('T')[0],
      volume: parseFloat(volume.toFixed(2)),
      volumeUSD: parseFloat(volumeUSD.toFixed(2)),
      count,
      change: parseFloat(change.toFixed(1))
    }
  })
}

// Generate mock MRR data
function generateMRRData(period: ChartPeriod): MRRChartData[] {
  let days = 7
  if (period === '30d') days = 30
  if (period === '90d') days = 90

  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))

    const baseMRR = 1250 // Base MRR in SOL
    const growth = i * 15 // Progressive growth
    const randomVariation = Math.random() * 50
    const mrr = baseMRR + growth + randomVariation

    const solToUSD = 100 // Mock SOL price
    const mrrUSD = mrr * solToUSD

    const previousMRR = i === 0 ? baseMRR : baseMRR + (i - 1) * 15 + Math.random() * 50
    const change = ((mrr - previousMRR) / previousMRR) * 100

    return {
      date: date.toISOString().split('T')[0],
      mrr: parseFloat(mrr.toFixed(2)),
      mrrUSD: parseFloat(mrrUSD.toFixed(2)),
      change: parseFloat(change.toFixed(1))
    }
  })
}

export function useChartData(period: ChartPeriod = '7d') {
  const [state, setState] = useState<ChartDataState>({
    transactions: [],
    mrr: [],
    loading: true,
    error: null
  })

  const fetchData = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    // Simulate async data loading with a small delay
    setTimeout(() => {
      try {
        const transactions = generateTransactionData(period)
        const mrr = generateMRRData(period)

        setState({
          transactions,
          mrr,
          loading: false,
          error: null
        })
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }))
      }
    }, 300) // 300ms delay to simulate network request
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch: fetchData
  }
}
