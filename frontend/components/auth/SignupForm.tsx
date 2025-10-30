'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
import { signupSchema, type SignupFormData } from '@/lib/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function SignupForm() {
  const { signup, isSigningUp, signupError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Show toast notification on error
  useEffect(() => {
    if (signupError) {
      // Check if it's an API error with message property
      const apiError = signupError as { message?: string };
      const errorMessage =
        apiError.message ||
        (signupError instanceof Error ? signupError.message : null) ||
        'An error occurred during sign up. Please try again.';

      toast.error('Sign up failed', {
        description: errorMessage,
      });
    }
  }, [signupError]);

  const onSubmit = (data: SignupFormData) => {
    signup(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          disabled={isSigningUp}
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="text-sm text-error">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          disabled={isSigningUp}
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
          disabled={isSigningUp}
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-error">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          disabled={isSigningUp}
          {...register('confirmPassword')}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Wallet Address Field */}
      <div className="space-y-2">
        <Label htmlFor="walletAddress">
          Solana Wallet Address
          <span className="text-xs text-muted ml-2">(Base58 format)</span>
        </Label>
        <Input
          id="walletAddress"
          type="text"
          placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
          disabled={isSigningUp}
          {...register('walletAddress')}
          aria-invalid={errors.walletAddress ? 'true' : 'false'}
          className="font-mono text-xs"
        />
        {errors.walletAddress && (
          <p className="text-sm text-error">{errors.walletAddress.message}</p>
        )}
      </div>

      {/* USDT Token Account Field */}
      <div className="space-y-2">
        <Label htmlFor="tokenAccountUSDT">
          USDT Token Account
          <span className="text-xs text-muted ml-2">(SPL Token Address)</span>
        </Label>
        <Input
          id="tokenAccountUSDT"
          type="text"
          placeholder="Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
          disabled={isSigningUp}
          {...register('tokenAccountUSDT')}
          aria-invalid={errors.tokenAccountUSDT ? 'true' : 'false'}
          className="font-mono text-xs"
        />
        {errors.tokenAccountUSDT && (
          <p className="text-sm text-error">{errors.tokenAccountUSDT.message}</p>
        )}
      </div>

      {/* USDC Token Account Field */}
      <div className="space-y-2">
        <Label htmlFor="tokenAccountUSDC">
          USDC Token Account
          <span className="text-xs text-muted ml-2">(SPL Token Address)</span>
        </Label>
        <Input
          id="tokenAccountUSDC"
          type="text"
          placeholder="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
          disabled={isSigningUp}
          {...register('tokenAccountUSDC')}
          aria-invalid={errors.tokenAccountUSDC ? 'true' : 'false'}
          className="font-mono text-xs"
        />
        {errors.tokenAccountUSDC && (
          <p className="text-sm text-error">{errors.tokenAccountUSDC.message}</p>
        )}
      </div>

      {/* Description Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description
          <span className="text-xs text-muted ml-2">(Optional)</span>
        </Label>
        <textarea
          id="description"
          placeholder="Tell us about your business or use case..."
          disabled={isSigningUp}
          {...register('description')}
          className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-brand hover:bg-brand-600"
        disabled={isSigningUp}
      >
        {isSigningUp ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Link to Signin */}
      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          href="/signin"
          className="text-brand hover:text-brand-600 underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
