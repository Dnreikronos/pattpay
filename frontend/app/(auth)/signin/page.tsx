'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SigninForm } from '@/components/auth/SigninForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SigninPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Only run on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // Always render the same structure on server and first client render
  // to prevent hydration mismatch
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl tracking-display">
          Welcome back
        </h1>
        <p className="text-sm text-muted">
          Sign in to manage your recurring payments
        </p>
      </div>

      {/* Only show loading/form after mount to prevent hydration issues */}
      {!mounted ? (
        <div className="h-96" />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : isAuthenticated ? null : (
        <SigninForm />
      )}
    </div>
  );
}
