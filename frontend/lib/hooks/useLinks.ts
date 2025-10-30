'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLinksQuery } from './useLinkQueries';
import { useCreateLink, useUpdateLink } from './useLinkMutations';
import { transformCheckoutLinks } from '../utils/link-transform';
import type { CheckoutLink, LinkFilters, LinkStats, LinkFiltersParams } from '@/types/link';

/**
 * Main links hook
 * Orchestrates TanStack Query hooks for payment links management
 * Maintains interface compatibility with existing UI components
 */
export function useLinks(filters: LinkFilters) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Convert UI filters to API params
  const apiFilters: LinkFiltersParams = useMemo(() => {
    const params: LinkFiltersParams = {
      page: currentPage,
      limit: perPage,
    };

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      // For now, use the first status (backend expects single status)
      params.status = filters.statuses[0] === 'active' ? 'ACTIVE' : 'INACTIVE';
    } else {
      params.status = 'all';
    }

    // Recurring filter
    if (filters.isRecurring !== undefined && filters.isRecurring !== 'all') {
      params.isRecurring = filters.isRecurring ? 'true' : 'false';
    } else {
      params.isRecurring = 'all';
    }

    // Search filter
    if (filters.search) {
      params.search = filters.search;
    }

    // Date preset filter
    if (filters.datePreset) {
      params.datePreset = filters.datePreset;
    }

    return params;
  }, [filters, currentPage, perPage]);

  // Fetch links using TanStack Query
  const { data, isLoading, error, refetch } = useLinksQuery(apiFilters);

  // Create and update mutations
  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Extract and transform data from response
  const links: CheckoutLink[] = data ? transformCheckoutLinks(data.links) : [];
  const stats: LinkStats = data?.stats || {
    totalActive: 0,
    totalCreated: 0,
    averageConversion: 0,
    totalRevenue: 0,
    totalRevenueUSD: 0,
  };
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  return {
    // Data
    links,
    stats,
    totalPages: pagination.totalPages,
    currentPage: pagination.page,
    perPage: pagination.limit,
    totalItems: pagination.total,

    // State
    loading: isLoading,
    error,

    // Actions
    setPage: setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    },
    refetch,

    // Mutations
    createLink: createMutation.mutate,
    createLinkAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateLink: updateMutation.mutate,
    updateLinkAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}

/**
 * Hook for fetching a single link details
 * Used in detail pages
 */
export { useLinkQuery as useLinkDetails } from './useLinkQueries';
