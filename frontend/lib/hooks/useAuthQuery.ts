'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authApi } from '../api/auth';
import { TokenStorage } from '../utils/token';

/**
 * Check if error is an authentication error (401, 403, 404)
 * These errors mean the token is invalid/expired and user should be logged out
 */
function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  // Check if it's our AuthApiError with statusCode
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    const statusCode = error.statusCode;
    // 401 = Unauthorized (invalid token)
    // 403 = Forbidden (token valid but no access)
    // 404 = User not found (token valid but user deleted)
    return statusCode === 401 || statusCode === 403 || statusCode === 404;
  }

  return false;
}

/**
 * Hook to fetch current authenticated user
 * Uses token from localStorage, fetches user data via TanStack Query
 */
export function useMe() {
  const token = TokenStorage.get();
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No token available');
      }
      const response = await authApi.getMe(token);
      return response.user;
    },
    enabled: !!token, // Only fetch if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth errors
  });

  // Handle ONLY authentication errors (401/403/404)
  // Network errors, 500s, etc. should NOT log the user out
  useEffect(() => {
    if (query.isError && query.error && isAuthError(query.error)) {
      // Clear token and redirect to signin only for auth failures
      TokenStorage.remove();
      queryClient.clear();
      router.push('/signin');
    }
  }, [query.isError, query.error, queryClient, router]);

  return query;
}
