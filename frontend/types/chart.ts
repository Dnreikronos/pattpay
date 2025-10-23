// Chart data types for dashboard analytics

export interface TransactionChartData {
  date: string // YYYY-MM-DD format
  volume: number // total volume in SOL
  volumeUSD: number // total volume in USD
  count: number // number of transactions
  change: number // % change vs previous day
}

export interface MRRChartData {
  date: string // YYYY-MM-DD format
  mrr: number // Monthly Recurring Revenue in SOL
  mrrUSD: number // MRR in USD
  change: number // % change vs previous period
}

export type ChartPeriod = '7d' | '30d' | '90d'

export interface ChartDataResponse {
  transactions: TransactionChartData[]
  mrr: MRRChartData[]
}
