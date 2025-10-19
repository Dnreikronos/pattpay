import { useState, useEffect, useMemo } from 'react'
import type { CheckoutLink, LinkFilters, LinkStats } from '@/types/link'
import { mockCheckoutLinks, mockLinkStats } from '@/mocks/data'

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function useLinks(filters: LinkFilters) {
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Simulate loading
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [filters])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Filter links based on filters
  const filteredLinks = useMemo(() => {
    let result = [...mockCheckoutLinks]

    // Filter by status
    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter(link => filters.statuses!.includes(link.status))
    }

    // Filter by recurring type
    if (filters.isRecurring !== undefined && filters.isRecurring !== 'all') {
      result = result.filter(link => link.isRecurring === filters.isRecurring)
    }

    // Filter by search (name or URL)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        link =>
          link.name.toLowerCase().includes(searchLower) ||
          link.url.toLowerCase().includes(searchLower) ||
          link.description?.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [filters])

  // Paginate
  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage
    const endIndex = startIndex + perPage
    return filteredLinks.slice(startIndex, endIndex)
  }, [filteredLinks, currentPage, perPage])

  const totalPages = Math.ceil(filteredLinks.length / perPage)

  // Calculate stats based on filtered links
  const stats: LinkStats = useMemo(() => {
    const activeLinks = filteredLinks.filter(l => l.status === 'active')
    const totalConversions = filteredLinks.reduce((sum, link) => sum + link.conversions, 0)
    const totalViews = filteredLinks.reduce((sum, link) => sum + link.views, 0)
    const avgConversion = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

    return {
      totalActive: activeLinks.length,
      totalCreated: filteredLinks.length,
      averageConversion: parseFloat(avgConversion.toFixed(1)),
      totalRevenue: filteredLinks.reduce((sum, link) => sum + (link.amount * link.totalPayments), 0),
      totalRevenueUSD: filteredLinks.reduce((sum, link) => sum + (link.amountUSD * link.totalPayments), 0)
    }
  }, [filteredLinks])

  return {
    links: paginatedLinks,
    stats,
    loading,
    totalPages,
    currentPage,
    setPage: setCurrentPage,
    perPage,
    setPerPage,
    totalItems: filteredLinks.length
  }
}
