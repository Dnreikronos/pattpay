import { useState, useEffect, useMemo } from 'react'
import { mockSubscriptions, mockSubscriptionStats } from '@/mocks/data'
import type { Subscription, SubscriptionStats, SubscriptionFilters } from '@/types/subscription'

interface UseSubscriptionsReturn {
  subscriptions: Subscription[]
  stats: SubscriptionStats
  loading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  setPage: (page: number) => void
  perPage: number
  setPerPage: (perPage: number) => void
}

export function useSubscriptions(filters?: SubscriptionFilters): UseSubscriptionsReturn {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(30)

  // Simulate API loading
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [filters, currentPage, perPage])

  // Filter subscriptions based on provided filters
  const filteredSubscriptions = useMemo(() => {
    let result = [...mockSubscriptions]

    // Status filter (multiple)
    if (filters?.statuses && filters.statuses.length > 0) {
      result = result.filter(s => filters.statuses!.includes(s.status))
    }

    // Date range filter
    if (filters?.dateRange) {
      const { from, to } = filters.dateRange
      result = result.filter(s => {
        const subscriptionDate = new Date(s.createdAt)
        return subscriptionDate >= from && subscriptionDate <= to
      })
    } else if (filters?.datePreset) {
      // Date preset filter
      const now = new Date()
      let daysAgo = 30 // default

      switch (filters.datePreset) {
        case 'last-7-days':
          daysAgo = 7
          break
        case 'last-30-days':
          daysAgo = 30
          break
        case 'last-90-days':
          daysAgo = 90
          break
      }

      const fromDate = new Date(now)
      fromDate.setDate(now.getDate() - daysAgo)

      result = result.filter(s => {
        const subscriptionDate = new Date(s.createdAt)
        return subscriptionDate >= fromDate && subscriptionDate <= now
      })
    }

    // Amount range filter
    if (filters?.amountRange) {
      const { min, max } = filters.amountRange
      if (min !== undefined) {
        result = result.filter(s => s.amount >= min)
      }
      if (max !== undefined) {
        result = result.filter(s => s.amount <= max)
      }
    }

    // Token mint filter
    if (filters?.tokenMint) {
      result = result.filter(s => s.tokenMint === filters.tokenMint)
    }

    // Search filter (payer name, wallet or plan name)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(s =>
        s.payerName.toLowerCase().includes(searchLower) ||
        s.payerWallet.toLowerCase().includes(searchLower) ||
        s.planName.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [filters])

  // Paginate results
  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage
    const endIndex = startIndex + perPage
    return filteredSubscriptions.slice(startIndex, endIndex)
  }, [filteredSubscriptions, currentPage, perPage])

  const totalPages = Math.ceil(filteredSubscriptions.length / perPage)

  return {
    subscriptions: paginatedSubscriptions,
    stats: mockSubscriptionStats,
    loading,
    error,
    totalPages,
    currentPage,
    setPage: setCurrentPage,
    perPage,
    setPerPage
  }
}
