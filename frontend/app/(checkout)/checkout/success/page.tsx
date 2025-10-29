"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("tx") || "N/A";
  const amount = searchParams.get("amount") || "0.00";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center"
        >
          <svg
            className="h-10 w-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        {/* Success message */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl text-foreground">
            Payment Successful!
          </h1>
          <p className="text-base font-mono text-muted max-w-md mx-auto">
            Your recurring payment has been set up successfully. Smart contracts
            will handle the rest automatically.
          </p>
        </div>

        {/* Transaction details */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-xs text-muted font-mono mb-1">Amount</p>
              <p className="text-lg font-mono text-foreground font-medium">
                {amount} USDC
              </p>
            </div>
            <div>
              <p className="text-xs text-muted font-mono mb-1">Status</p>
              <p className="text-lg font-mono text-success font-medium">
                Active
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-left">
            <p className="text-xs text-muted font-mono mb-2">Transaction ID</p>
            <div className="bg-background border border-border rounded p-3">
              <p className="text-xs font-mono text-foreground break-all">
                {transactionId}
              </p>
            </div>
          </div>

          <a
            href={`https://solscan.io/tx/${transactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-brand
                     hover:text-brand-600 transition-colors"
          >
            View on Solscan
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        {/* Next steps */}
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6 text-left space-y-3">
          <h2 className="font-display text-sm text-foreground">What&apos;s Next?</h2>
          <ul className="space-y-2 text-xs font-mono text-muted">
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>
                You&apos;ll receive a confirmation email with all the details
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>
                Payments will be processed automatically each billing cycle
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>
                You can view and manage your subscription in your dashboard
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>Cancel anytime directly from your wallet or dashboard</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="https://pattpay.com/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-600
                     text-white font-mono text-sm py-3 px-6 rounded-lg
                     transition-colors duration-200"
          >
            Go to Dashboard
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <Link
            href="https://pattpay.com"
            className="inline-flex items-center justify-center gap-2 bg-surface hover:bg-background
                     text-foreground border border-border font-mono text-sm py-3 px-6 rounded-lg
                     transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
          <div className="mx-auto w-20 h-20 bg-muted/20 rounded-full animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 bg-muted/20 rounded w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-muted/20 rounded w-96 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
