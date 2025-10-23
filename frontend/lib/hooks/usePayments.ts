import { useState, useEffect, useMemo } from 'react'
import { mockPayments, mockPaymentStats } from '@/mocks/data'
import type { Payment, PaymentStats, PaymentFilters } from '@/types/payment'

interface UsePaymentsReturn {
  payments: Payment[]
  stats: PaymentStats
  loading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  setPage: (page: number) => void
  perPage: number
  setPerPage: (perPage: number) => void
}

export function usePayments(filters?: PaymentFilters): UsePaymentsReturn {
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

  // Filter payments based on provided filters
  const filteredPayments = useMemo(() => {
    let result = [...mockPayments]

    // Status filter (múltiplos)
    if (filters?.statuses && filters.statuses.length > 0) {
      result = result.filter(p => filters.statuses!.includes(p.status))
    }

    // Date range filter
    if (filters?.dateRange) {
      const { from, to } = filters.dateRange
      result = result.filter(p => {
        const paymentDate = new Date(p.createdAt)
        return paymentDate >= from && paymentDate <= to
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

      result = result.filter(p => {
        const paymentDate = new Date(p.createdAt)
        return paymentDate >= fromDate && paymentDate <= now
      })
    }

    // Amount range filter
    if (filters?.amountRange) {
      const { min, max } = filters.amountRange
      if (min !== undefined) {
        result = result.filter(p => p.amount >= min)
      }
      if (max !== undefined) {
        result = result.filter(p => p.amount <= max)
      }
    }

    // Search filter (hash or wallet)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(p =>
        p.hash.toLowerCase().includes(searchLower) ||
        p.from.toLowerCase().includes(searchLower) ||
        p.to.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [filters])

  // Paginate results
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage
    const endIndex = startIndex + perPage
    return filteredPayments.slice(startIndex, endIndex)
  }, [filteredPayments, currentPage, perPage])

  const totalPages = Math.ceil(filteredPayments.length / perPage)

  return {
    payments: paginatedPayments,
    stats: mockPaymentStats,
    loading,
    error,
    totalPages,
    currentPage,
    setPage: setCurrentPage,
    perPage,
    setPerPage
  }
}
