// Checkout Link types for PattPay dashboard

export interface CheckoutLink {
  id: string
  name: string // Link name/title (e.g., 'Premium Plan', 'Donation Button')
  amount: number // Amount in SOL
  amountUSD: number // Amount in USD
  status: 'active' | 'inactive'
  url: string // Checkout link URL
  isRecurring: boolean // One-time or recurring payment
  redirectUrl?: string // URL to redirect after successful payment
  description?: string // Optional description
  createdAt: string // ISO 8601 timestamp
  totalPayments: number // Total payments received through this link
  conversions: number // Number of successful conversions
  views: number // Number of times the link was viewed
}

export interface LinkStats {
  totalActive: number // Total active links
  totalCreated: number // Total links created (active + inactive)
  averageConversion: number // Average conversion rate (%)
  totalRevenue: number // Total revenue from all links (SOL)
  totalRevenueUSD: number // Total revenue in USD
}

export type LinkStatus = 'active' | 'inactive'

export interface LinkFilters {
  statuses?: LinkStatus[]
  isRecurring?: boolean | 'all' // Filter by recurring type
  search?: string // Search by name or URL
  dateRange?: {
    from: Date
    to: Date
  }
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'
}

export interface LinkTableProps {
  links: CheckoutLink[]
  loading?: boolean
  onRowClick?: (id: string) => void
}
