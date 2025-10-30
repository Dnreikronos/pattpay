'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      </div>
    );
  }

  // If authenticated, don't render form (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  // Not authenticated - show signup form
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl tracking-display">
          Create Account
        </h1>
        <p className="text-sm text-muted">
          Join PattPay and automate your recurring payments on Solana
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
