// Subscription types for PattPay dashboard

export interface Subscription {
  id: string
  planId: string
  payerId: string
  payerName: string
  payerWallet: string
  planName: string
  planDescription: string | null
  tokenMint: string // Token type (USDT, USDC, etc.)
  tokenDecimals: number
  amount: number // Amount per billing cycle
  amountUSD: number // Amount in USD
  status: 'active' | 'cancelled' | 'expired'
  nextDueAt: string // ISO 8601 timestamp
  lastPaidAt: string // ISO 8601 timestamp
  totalApprovedAmount: number // Total amount approved by payer
  durationMonths: number // Plan duration in months
  periodSeconds: number // Billing period in seconds
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

export interface SubscriptionStats {
  activeSubscriptions: number // Total active subscriptions
  mrr: number // Monthly Recurring Revenue in SOL
  mrrUSD: number // Monthly Recurring Revenue in USD
  arr: number // Annual Recurring Revenue in SOL
  arrUSD: number // Annual Recurring Revenue in USD
  arrTrend: number // ARR trend vs last period (%)
  newSubscriptions: number // New subscriptions this month
  cancelledSubscriptions: number // Cancelled this month
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

export interface SubscriptionFilters {
  statuses?: SubscriptionStatus[]
  dateRange?: {
    from: Date
    to: Date
  }
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'
  amountRange?: {
    min?: number
    max?: number
  }
  search?: string // Search by payer name, wallet or plan name
  tokenMint?: string // Filter by token type
}

export interface SubscriptionTableProps {
  subscriptions: Subscription[]
  loading?: boolean
  onSort?: (column: keyof Subscription) => void
  onRowClick?: (id: string) => void
}
