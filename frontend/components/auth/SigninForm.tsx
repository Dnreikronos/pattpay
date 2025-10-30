'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
import { signinSchema, type SigninFormData } from '@/lib/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function SigninForm() {
  const { signin, isSigningIn, signinError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  // Show toast notification on error
  useEffect(() => {
    if (signinError) {
      // Check if it's an API error with message property
      const apiError = signinError as { message?: string };
      const errorMessage =
        apiError.message ||
        (signinError instanceof Error ? signinError.message : null) ||
        'An error occurred during sign in. Please try again.';

      toast.error('Sign in failed', {
        description: errorMessage,
      });
    }
  }, [signinError]);

  const onSubmit = (data: SigninFormData) => {
    signin(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          disabled={isSigningIn}
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={isSigningIn}
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-error">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-brand hover:bg-brand-600"
        disabled={isSigningIn}
      >
        {isSigningIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      {/* Link to Signup */}
      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-brand hover:text-brand-600 underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
