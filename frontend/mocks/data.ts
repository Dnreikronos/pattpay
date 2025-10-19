// Mock data for PattPay Dashboard API

import type { TransactionChartData, MRRChartData } from '@/types/chart'
import type { Payment, PaymentStats } from '@/types/payment'

// Generate last 7 days of transaction data
export const mockTransactionChartData: TransactionChartData[] = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - i))

  const baseCount = 45
  const randomVariation = Math.floor(Math.random() * 30) - 15
  const count = baseCount + randomVariation

  const baseVolume = 150 // Base volume in SOL
  const volumeVariation = Math.random() * 100 - 50
  const volume = baseVolume + volumeVariation

  const solToUSD = 100 // Mock SOL price
  const volumeUSD = volume * solToUSD

  const change = i === 0 ? 0 : ((count - (baseCount + (Math.floor(Math.random() * 30) - 15))) / baseCount) * 100

  return {
    date: date.toISOString().split('T')[0],
    volume: parseFloat(volume.toFixed(2)),
    volumeUSD: parseFloat(volumeUSD.toFixed(2)),
    count: Math.max(count, 10),
    change: parseFloat(change.toFixed(1))
  }
})

// Generate last 7 days of MRR data
export const mockMRRChartData: MRRChartData[] = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - i))

  const baseMRR = 1250 // Base MRR in SOL
  const growth = i * 15 // Progressive growth
  const randomVariation = Math.random() * 50
  const mrr = baseMRR + growth + randomVariation

  const solToUSD = 100 // Mock SOL price
  const mrrUSD = mrr * solToUSD

  const change = i === 0 ? 0 : ((mrr - (baseMRR + (i - 1) * 15)) / (baseMRR + (i - 1) * 15)) * 100

  return {
    date: date.toISOString().split('T')[0],
    mrr: parseFloat(mrr.toFixed(2)),
    mrrUSD: parseFloat(mrrUSD.toFixed(2)),
    change: parseFloat(change.toFixed(1))
  }
})

// Interface for Transaction (from API_MOCK.md)
export interface Transaction {
  id: string
  hash: string
  amount: number // SOL
  amountUSD: number
  status: 'success' | 'pending' | 'failed'
  from: string // wallet address
  to: string // wallet address
  linkId?: string
  linkName?: string
  block: number
  confirmations: number
  fee: number
  createdAt: string // ISO 8601
  confirmedAt?: string // ISO 8601
}

// Interface for PaymentLink (from API_MOCK.md)
export interface PaymentLink {
  id: string
  name: string
  description: string
  amount: number // SOL
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: 'active' | 'paused' | 'expired'
  url: string
  views: number
  conversions: number
  conversionRate: number // percentage
  expiresAt?: string // ISO 8601
  maxUses?: number
  currentUses: number
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

// Interface for DashboardStats (from API_MOCK.md)
export interface DashboardStats {
  totalTransactions: number
  totalVolume: number // SOL
  totalVolumeUSD: number
  activeLinks: number
  newLinksThisWeek: number
  conversionRate: number
  trend: {
    transactions: number // % change
    volume: number // % change
    links: number // % change
    conversion: number // % change
  }
}

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    hash: '5Kn7zXq8PwMjL3yR9vB2nTcS4uD6fG1hW0eA7mX8pY9q',
    amount: 10.5,
    amountUSD: 1050,
    status: 'success',
    from: 'AbCd1234...XyZ9',
    to: 'EfGh5678...WvU1',
    linkId: 'link_1',
    linkName: 'Pro Subscription',
    block: 123456789,
    confirmations: 32,
    fee: 0.000005,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    confirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000).toISOString()
  },
  {
    id: 'tx_2',
    hash: '8Rp4wXy9NmKjH2vC5bT7nUcV3sD8fG0hW1eB9mY6pZ2q',
    amount: 5.25,
    amountUSD: 525,
    status: 'success',
    from: 'GhIj5678...AbC3',
    to: 'MnOp9012...DeF7',
    linkId: 'link_2',
    linkName: 'Monthly Donation',
    block: 123456788,
    confirmations: 48,
    fee: 0.000005,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    confirmedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1500).toISOString()
  },
  {
    id: 'tx_3',
    hash: '3Tp2aXb8QmLkI5vD9cU2nVeW4sE7gH1jX0fC6nZ3pY8r',
    amount: 15.0,
    amountUSD: 1500,
    status: 'pending',
    from: 'KlMn9012...EfG5',
    to: 'QrSt3456...IjK9',
    linkId: 'link_1',
    linkName: 'Pro Subscription',
    block: 123456790,
    confirmations: 12,
    fee: 0.000005,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
  },
  {
    id: 'tx_4',
    hash: '6Wp9cYe3RnMlJ8wE2dV5oXfZ1tG4hK0kY2gD7oA9qB3s',
    amount: 3.5,
    amountUSD: 350,
    status: 'failed',
    from: 'OpQr3456...KlM1',
    to: 'UvWx7890...NoP5',
    block: 123456787,
    confirmations: 0,
    fee: 0.000005,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'tx_5',
    hash: '9Zq5fZh7UnPlK2xG6eW3pYgA8uH5jL1mZ4hE9pC2rD7t',
    amount: 7.8,
    amountUSD: 780,
    status: 'success',
    from: 'StUv7890...PqR3',
    to: 'WxYz1234...TuV7',
    linkId: 'link_3',
    linkName: 'Annual Plan',
    block: 123456786,
    confirmations: 64,
    fee: 0.000005,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    confirmedAt: new Date(Date.now() - 72 * 60 * 60 * 1000 + 1800).toISOString()
  }
]

// Mock Payment Links
export const mockLinks: PaymentLink[] = [
  {
    id: 'link_1',
    name: 'Pro Subscription',
    description: 'Monthly subscription for pro features',
    amount: 10,
    recurrence: 'monthly',
    status: 'active',
    url: 'https://pay.pattpay.com/link/abc123',
    views: 145,
    conversions: 34,
    conversionRate: 23.4,
    expiresAt: undefined,
    maxUses: undefined,
    currentUses: 34,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'link_2',
    name: 'Monthly Donation',
    description: 'Support our project with a monthly donation',
    amount: 5,
    recurrence: 'monthly',
    status: 'active',
    url: 'https://pay.pattpay.com/link/def456',
    views: 89,
    conversions: 21,
    conversionRate: 23.6,
    expiresAt: undefined,
    maxUses: undefined,
    currentUses: 21,
    createdAt: '2025-09-15T12:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'link_3',
    name: 'Annual Plan',
    description: 'Yearly subscription with discount',
    amount: 100,
    recurrence: 'yearly',
    status: 'active',
    url: 'https://pay.pattpay.com/link/ghi789',
    views: 56,
    conversions: 8,
    conversionRate: 14.3,
    expiresAt: undefined,
    maxUses: undefined,
    currentUses: 8,
    createdAt: '2025-08-01T14:00:00Z',
    updatedAt: new Date().toISOString()
  }
]

// Mock Dashboard Stats
export const mockStats: DashboardStats = {
  totalTransactions: 1247,
  totalVolume: 5234.5,
  totalVolumeUSD: 525400,
  activeLinks: 12,
  newLinksThisWeek: 3,
  conversionRate: 23.5,
  trend: {
    transactions: 12.5,
    volume: -3.2,
    links: 25.0,
    conversion: 5.3
  }
}

// Mock Activity Data (last 30 days) - for backwards compatibility
export const mockActivity = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  volume: Math.random() * 200 + 50,
  count: Math.floor(Math.random() * 50 + 10)
}))

// Mock Payments Data
const generateRandomHash = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const generateWalletAddress = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789'
  const start = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const end = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${start}...${end}`
}

export const mockPayments: Payment[] = Array.from({ length: 50 }, (_, i) => {
  const status: Payment['status'] =
    i % 10 === 0 ? 'failed' :
    i % 7 === 0 ? 'pending' :
    'success'

  const hoursAgo = i * 2 + Math.floor(Math.random() * 3)
  const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
  const confirmedAt = status === 'success' ? new Date(createdAt.getTime() + 2000) : undefined

  const amount = parseFloat((Math.random() * 20 + 1).toFixed(2))
  const solToUSD = 100
  const amountUSD = parseFloat((amount * solToUSD).toFixed(2))

  const links = ['Pro Subscription', 'Monthly Donation', 'Annual Plan', 'Basic Tier', 'Premium Access']
  const hasLink = i % 3 !== 0

  return {
    id: `pay_${i + 1}`,
    hash: generateRandomHash(),
    amount,
    amountUSD,
    status,
    from: generateWalletAddress(),
    to: generateWalletAddress(),
    linkId: hasLink ? `link_${(i % 5) + 1}` : undefined,
    linkName: hasLink ? links[i % 5] : undefined,
    block: 123456789 - i,
    confirmations: status === 'success' ? Math.floor(Math.random() * 50 + 20) : status === 'pending' ? Math.floor(Math.random() * 15) : 0,
    fee: 0.000005,
    createdAt: createdAt.toISOString(),
    confirmedAt: confirmedAt?.toISOString()
  }
})

// Mock Payment Stats
export const mockPaymentStats: PaymentStats = {
  totalToday: 24,
  volumeToday: 187.5,
  volumeTodayUSD: 18750,
  averageTicket: 781.25, // $18,750 / 24 payments
  averageTicketTrend: 5.2 // +5.2% vs yesterday
}
