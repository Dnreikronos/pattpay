// Payment types for PattPay dashboard

export interface Payment {
  id: string
  hash: string // Transaction hash on Solana
  amount: number // Amount in SOL
  amountUSD: number // Amount in USD
  status: 'success' | 'pending' | 'failed'
  from: string // Wallet address (sender)
  to: string // Wallet address (receiver)
  linkId?: string // Associated payment link ID
  linkName?: string // Associated payment link name
  block: number // Block number on Solana
  confirmations: number
  fee: number // Transaction fee in SOL
  createdAt: string // ISO 8601 timestamp
  confirmedAt?: string // ISO 8601 timestamp (only for success)
}

export interface PaymentStats {
  totalToday: number // Total payments received today
  volumeToday: number // Total volume in SOL (24h)
  volumeTodayUSD: number // Total volume in USD (24h)
  averageTicket: number // Average payment amount in USD
  averageTicketTrend: number // Trend vs yesterday (%)
}

export type PaymentStatus = 'success' | 'pending' | 'failed'

export interface PaymentFilters {
  statuses?: PaymentStatus[] // Múltiplos status permitidos
  dateRange?: {
    from: Date
    to: Date
  }
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'
  amountRange?: {
    min?: number
    max?: number
  }
  search?: string // Search by hash or wallet
}

export interface PaymentTableProps {
  payments: Payment[]
  loading?: boolean
  onSort?: (column: keyof Payment) => void
  onRowClick?: (id: string) => void
}
