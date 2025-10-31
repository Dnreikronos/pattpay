"use client";

import { useEffect } from "react";

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Payment page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface border-2 border-border rounded-lg p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-display text-lg text-foreground">
            Something Went Wrong
          </h1>
          <p className="text-sm text-muted font-mono">
            We encountered an error while loading this payment link.
          </p>
        </div>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-background border border-border rounded p-4 text-left">
            <p className="text-xs text-error font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-600
                     text-white font-mono text-sm rounded-lg
                     shadow-[4px_4px_0_0_rgba(79,70,229,0.3)]
                     hover:-translate-x-[2px] hover:-translate-y-[2px]
                     active:shadow-[2px_2px_0_0_rgba(79,70,229,0.3)]
                     active:translate-x-[1px] active:translate-y-[1px]
                     transition-all duration-150"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-surface hover:bg-background
                     text-foreground font-mono text-sm rounded-lg
                     border-2 border-border
                     transition-colors duration-150"
          >
            Reload Page
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted font-mono">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
