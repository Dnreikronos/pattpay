'use client';

import { useSignin, useSignup, useLogout } from './useAuthMutations';
import { useMe } from './useAuthQuery';
import { TokenStorage } from '../utils/token';

/**
 * Main authentication hook
 * Combines TanStack Query (for API calls) with localStorage (for token persistence)
 */
export function useAuth() {
  const token = TokenStorage.get();
  const signinMutation = useSignin();
  const signupMutation = useSignup();
  const logout = useLogout();
  const { data: user, isLoading: isLoadingUser, isFetching } = useMe();

  // Only consider user loading if there's a token
  // If no token, we're not loading user data
  const isCheckingAuth = token ? (isLoadingUser || isFetching) : false;

  return {
    // State
    user: user ?? null,
    token,
    isAuthenticated: !!user && !!token,
    isLoading: signinMutation.isPending || signupMutation.isPending || isCheckingAuth,

    // Mutations
    signin: signinMutation.mutate,
    signinAsync: signinMutation.mutateAsync,
    isSigningIn: signinMutation.isPending,
    signinError: signinMutation.error,

    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error,

    logout,
  };
}
