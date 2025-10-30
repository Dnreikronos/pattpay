// Mock data for PattPay Dashboard API

import type { TransactionChartData, MRRChartData } from '@/types/chart'
import type { Payment, PaymentStats } from '@/types/payment'
import type { CheckoutLink, LinkStats } from '@/types/link'
import type { Subscription, SubscriptionStats } from '@/types/subscription'

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

// Mock Checkout Links
export const mockCheckoutLinks: CheckoutLink[] = [
  {
    id: 'cl_1',
    name: 'Premium Plan Monthly',
    amount: 15.0,
    amountUSD: 1500,
    amountUSDC: 15.0,
    amountUSDT: 15.0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/premium-monthly',
    isRecurring: true,
    redirectUrl: 'https://app.example.com/success',
    description: 'Monthly subscription for premium features',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 47,
    conversions: 47,
    views: 189,
    tokenPrices: [
      { id: 'tp_1', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '15.00' },
      { id: 'tp_2', token: 'USDT', tokenMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', tokenDecimals: 6, price: '15.00' },
    ]
  },
  {
    id: 'cl_2',
    name: 'One-time Donation',
    amount: 5.0,
    amountUSD: 500,
    amountUSDC: 5.0,
    amountUSDT: 5.0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/donation',
    isRecurring: false,
    redirectUrl: 'https://thankyou.example.com',
    description: 'Support our mission',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 234,
    conversions: 234,
    views: 1056,
    tokenPrices: [
      { id: 'tp_3', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '5.00' },
    ]
  },
  {
    id: 'cl_3',
    name: 'Annual Subscription',
    amount: 150.0,
    amountUSD: 15000,
    amountUSDC: 150.0,
    amountUSDT: 150.0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/annual-sub',
    isRecurring: true,
    redirectUrl: 'https://app.example.com/welcome',
    description: 'Yearly plan with 20% discount',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 12,
    conversions: 12,
    views: 98,
    tokenPrices: [
      { id: 'tp_4', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '150.00' },
    ]
  },
  {
    id: 'cl_4',
    name: 'Basic Tier',
    amount: 8.0,
    amountUSD: 800,
    amountUSDC: 8.0,
    amountUSDT: 8.0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/basic-tier',
    isRecurring: true,
    redirectUrl: 'https://app.example.com/dashboard',
    description: null,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 89,
    conversions: 89,
    views: 412,
    tokenPrices: [
      { id: 'tp_5', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '8.00' },
    ]
  },
  {
    id: 'cl_5',
    name: 'Coffee Tip ☕',
    amount: 1.0,
    amountUSD: 100,
    amountUSDC: 1.0,
    amountUSDT: 0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/coffee',
    isRecurring: false,
    redirectUrl: 'https://thanks.example.com',
    description: 'Buy me a coffee',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 156,
    conversions: 156,
    views: 523,
    tokenPrices: [
      { id: 'tp_6', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '1.00' },
    ]
  },
  {
    id: 'cl_6',
    name: 'Weekly Newsletter',
    amount: 3.0,
    amountUSD: 300,
    amountUSDC: 3.0,
    amountUSDT: 3.0,
    status: 'inactive',
    url: 'https://pay.pattpay.com/cl/newsletter',
    isRecurring: true,
    redirectUrl: null,
    description: 'Weekly premium newsletter access',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 23,
    conversions: 23,
    views: 145,
    tokenPrices: [
      { id: 'tp_7', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '3.00' },
    ]
  },
  {
    id: 'cl_7',
    name: 'Product Purchase',
    amount: 49.99,
    amountUSD: 4999,
    amountUSDC: 49.99,
    amountUSDT: 0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/product-x',
    isRecurring: false,
    redirectUrl: 'https://shop.example.com/confirmation',
    description: 'One-time product payment',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 67,
    conversions: 67,
    views: 342,
    tokenPrices: [
      { id: 'tp_8', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '49.99' },
    ]
  },
  {
    id: 'cl_8',
    name: 'VIP Access Monthly',
    amount: 25.0,
    amountUSD: 2500,
    amountUSDC: 25.0,
    amountUSDT: 25.0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/vip-monthly',
    isRecurring: true,
    redirectUrl: 'https://vip.example.com',
    description: 'Exclusive VIP member benefits',
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 34,
    conversions: 34,
    views: 156,
    tokenPrices: [
      { id: 'tp_9', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '25.00' },
      { id: 'tp_10', token: 'USDT', tokenMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', tokenDecimals: 6, price: '25.00' },
    ]
  },
  {
    id: 'cl_9',
    name: 'Early Bird Special',
    amount: 99.0,
    amountUSD: 9900,
    amountUSDC: 99.0,
    amountUSDT: 0,
    status: 'inactive',
    url: 'https://pay.pattpay.com/cl/earlybird',
    isRecurring: false,
    redirectUrl: null,
    description: 'Limited time early bird offer',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 45,
    conversions: 45,
    views: 234,
    tokenPrices: [
      { id: 'tp_11', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '99.00' },
    ]
  },
  {
    id: 'cl_10',
    name: 'Starter Pack',
    amount: 12.5,
    amountUSD: 1250,
    amountUSDC: 12.5,
    amountUSDT: 0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/starter',
    isRecurring: true,
    redirectUrl: 'https://app.example.com/onboarding',
    description: 'Perfect for beginners',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 78,
    conversions: 78,
    views: 389,
    tokenPrices: [
      { id: 'tp_12', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '12.50' },
    ]
  },
  {
    id: 'cl_11',
    name: 'Community Support',
    amount: 2.0,
    amountUSD: 200,
    amountUSDC: 2.0,
    amountUSDT: 0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/community',
    isRecurring: true,
    redirectUrl: null,
    description: 'Monthly community contribution',
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 123,
    conversions: 123,
    views: 567,
    tokenPrices: [
      { id: 'tp_13', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '2.00' },
    ]
  },
  {
    id: 'cl_12',
    name: 'Pro Features Upgrade',
    amount: 20.0,
    amountUSD: 2000,
    amountUSDC: 20.0,
    amountUSDT: 0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/pro-upgrade',
    isRecurring: false,
    redirectUrl: 'https://app.example.com/pro',
    description: 'One-time upgrade to pro features',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 56,
    conversions: 56,
    views: 234,
    tokenPrices: [
      { id: 'tp_14', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '20.00' },
    ]
  },
  {
    id: 'cl_13',
    name: 'Workshop Registration',
    amount: 75.0,
    amountUSD: 7500,
    amountUSDC: 75.0,
    amountUSDT: 0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/workshop',
    isRecurring: false,
    redirectUrl: 'https://events.example.com/registered',
    description: 'Exclusive workshop access',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 28,
    conversions: 28,
    views: 112,
    tokenPrices: [
      { id: 'tp_15', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '75.00' },
    ]
  },
  {
    id: 'cl_14',
    name: 'Quarterly Membership',
    amount: 40.0,
    amountUSD: 4000,
    amountUSDC: 40.0,
    amountUSDT: 0,
    status: 'active',
    url: 'https://pay.pattpay.com/cl/quarterly',
    isRecurring: true,
    redirectUrl: 'https://members.example.com',
    description: 'Billed every 3 months',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 19,
    conversions: 19,
    views: 87,
    tokenPrices: [
      { id: 'tp_16', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '40.00' },
    ]
  },
  {
    id: 'cl_15',
    name: 'Beta Access',
    amount: 0.5,
    amountUSD: 50,
    amountUSDC: 0.5,
    amountUSDT: 0,
    status: 'inactive',
    url: 'https://pay.pattpay.com/cl/beta',
    isRecurring: false,
    redirectUrl: null,
    description: 'Early access to beta features',
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 342,
    conversions: 342,
    views: 1234,
    tokenPrices: [
      { id: 'tp_17', token: 'USDC', tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenDecimals: 6, price: '0.50' },
    ]
  }
]

// Mock Link Stats
export const mockLinkStats: LinkStats = {
  totalActive: mockCheckoutLinks.filter(l => l.status === 'active').length,
  totalCreated: mockCheckoutLinks.length,
  averageConversion: 21.8, // Average conversion rate across all links
  totalRevenue: mockCheckoutLinks.reduce((sum, link) => sum + (link.amount * link.totalPayments), 0),
  totalRevenueUSD: mockCheckoutLinks.reduce((sum, link) => sum + (link.amountUSD * link.totalPayments), 0)
}

// Helper function to generate payer names
const generatePayerName = () => {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

// Mock Subscriptions
export const mockSubscriptions: Subscription[] = Array.from({ length: 45 }, (_, i) => {
  const status: Subscription['status'] =
    i % 12 === 0 ? 'cancelled' :
    i % 15 === 0 ? 'expired' :
    'active'

  const daysAgo = i * 7 + Math.floor(Math.random() * 7)
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

  // Last payment was between 1-30 days ago for active, longer for others
  const lastPaidDaysAgo = status === 'active'
    ? Math.floor(Math.random() * 30)
    : 30 + Math.floor(Math.random() * 60)
  const lastPaidAt = new Date(Date.now() - lastPaidDaysAgo * 24 * 60 * 60 * 1000)

  // Next payment is in the future for active, in the past for others
  const nextDueDaysOffset = status === 'active'
    ? Math.floor(Math.random() * 30) + 1 // 1-30 days in future
    : -(Math.floor(Math.random() * 30) + 1) // 1-30 days in past
  const nextDueAt = new Date(Date.now() + nextDueDaysOffset * 24 * 60 * 60 * 1000)

  const plans = [
    { name: 'Pro Plan', description: 'Full access to all premium features', duration: 12, period: 2592000 }, // 30 days
    { name: 'Basic Plan', description: 'Essential features for starters', duration: 12, period: 2592000 },
    { name: 'Enterprise Plan', description: 'Unlimited access with priority support', duration: 12, period: 2592000 },
    { name: 'Student Plan', description: 'Discounted plan for students', duration: 6, period: 2592000 },
    { name: 'Annual Premium', description: 'Premium features billed yearly', duration: 12, period: 31536000 }, // 365 days
  ]
  const plan = plans[i % plans.length]

  const tokens = [
    { mint: 'USDT', decimals: 6 },
    { mint: 'USDC', decimals: 6 },
  ]
  const token = tokens[i % tokens.length]

  const amount = parseFloat((Math.random() * 50 + 10).toFixed(2))
  const solToUSD = 100
  const amountUSD = parseFloat((amount * solToUSD).toFixed(2))
  const totalApproved = amount * plan.duration

  return {
    id: `sub_${i + 1}`,
    planId: `plan_${(i % 5) + 1}`,
    payerId: `payer_${i + 1}`,
    payerName: generatePayerName(),
    payerWallet: generateWalletAddress(),
    planName: plan.name,
    planDescription: plan.description,
    tokenMint: token.mint,
    tokenDecimals: token.decimals,
    amount,
    amountUSD,
    status,
    nextDueAt: nextDueAt.toISOString(),
    lastPaidAt: lastPaidAt.toISOString(),
    totalApprovedAmount: totalApproved,
    durationMonths: plan.duration,
    periodSeconds: plan.period,
    createdAt: createdAt.toISOString(),
    updatedAt: new Date().toISOString()
  }
})

// Mock Subscription Stats
export const mockSubscriptionStats: SubscriptionStats = {
  activeSubscriptions: mockSubscriptions.filter(s => s.status === 'active').length,
  mrr: mockSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0),
  mrrUSD: mockSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amountUSD, 0),
  arr: mockSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0) * 12, // MRR * 12
  arrUSD: mockSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amountUSD, 0) * 12, // MRR * 12 in USD
  arrTrend: 12.5, // +12.5% ARR growth
  newSubscriptions: 8, // New subscriptions this month
  cancelledSubscriptions: 3 // Cancelled this month
}
