'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SigninForm } from '@/components/auth/SigninForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SigninPage() {
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

  // Not authenticated - show signin form
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

      <SigninForm />
    </div>
  );
}
