'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../api/auth';
import { TokenStorage } from '../utils/token';

/**
 * Hook for signin mutation
 * Uses TanStack Query for API call, localStorage for token persistence
 */
export function useSignin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signin,
    onSuccess: (data) => {
      // Save token to localStorage
      TokenStorage.set(data.token);

      // Set query data for immediate access
      queryClient.setQueryData(['auth', 'me'], data.user);

      // Show success toast
      toast.success('Welcome back!', {
        description: `Successfully signed in as ${data.user.email}`,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    },
  });
}

/**
 * Hook for signup mutation
 * Uses TanStack Query for API call, localStorage for token persistence
 */
export function useSignup() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      // Save token to localStorage
      TokenStorage.set(data.token);

      // Set query data for immediate access
      queryClient.setQueryData(['auth', 'me'], data.user);

      // Show success toast
      toast.success('Account created!', {
        description: `Welcome to PattPay, ${data.user.name}!`,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    },
  });
}

/**
 * Hook for logout
 * Clears token and query cache
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    // Remove token from localStorage
    TokenStorage.remove();

    // Clear all queries
    queryClient.clear();

    // Redirect to signin
    router.push('/signin');
  };
}
