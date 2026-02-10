'use client';

import { useQuery } from '@tanstack/react-query';
import { linksApi } from '../api/links';
import { TokenStorage } from '../utils/token';
import type { LinkFiltersParams } from '@/types/link';

/**
 * Query hook to fetch all payment links with filters
 */
export function useLinksQuery(filters?: LinkFiltersParams) {
  const token = TokenStorage.get();

  return useQuery({
    queryKey: ['links', filters],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return linksApi.getAll(token, filters);
    },
    enabled: !!token,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Query hook to fetch a single payment link by ID (authenticated)
 */
export function useLinkQuery(id: string) {
  const token = TokenStorage.get();

  return useQuery({
    queryKey: ['link', id],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return linksApi.getById(token, id);
    },
    enabled: !!token && !!id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Query hook to fetch a single payment link by ID (public - no auth required)
 * Used for the public payment checkout page
 */
export function usePublicLinkQuery(id: string) {
  return useQuery({
    queryKey: ['public-link', id],
    queryFn: () => linksApi.getByIdPublic(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
    retry: 1, // Only retry once for public links
  });
}
