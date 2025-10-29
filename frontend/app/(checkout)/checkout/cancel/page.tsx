"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8"
      >
        {/* Cancel icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center"
        >
          <svg
            className="h-10 w-10 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.div>

        {/* Cancel message */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-base font-mono text-muted max-w-md mx-auto">
            Your payment was not completed. No charges have been made to your
            wallet.
          </p>
        </div>

        {/* Information box */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 text-left">
          <h2 className="font-display text-sm text-foreground">
            What Happened?
          </h2>
          <p className="text-xs font-mono text-muted">
            The payment process was cancelled before completion. This could be
            because:
          </p>
          <ul className="space-y-2 text-xs font-mono text-muted">
            <li className="flex gap-2">
              <span className="text-warning">•</span>
              <span>You cancelled the transaction in your wallet</span>
            </li>
            <li className="flex gap-2">
              <span className="text-warning">•</span>
              <span>The connection to your wallet was interrupted</span>
            </li>
            <li className="flex gap-2">
              <span className="text-warning">•</span>
              <span>You navigated away before completing the payment</span>
            </li>
            <li className="flex gap-2">
              <span className="text-warning">•</span>
              <span>The transaction timed out</span>
            </li>
          </ul>
        </div>

        {/* Help section */}
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6 text-left space-y-3">
          <h2 className="font-display text-sm text-foreground">Need Help?</h2>
          <p className="text-xs font-mono text-muted">
            If you&apos;re experiencing issues completing your payment:
          </p>
          <ul className="space-y-2 text-xs font-mono text-muted">
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>Make sure your wallet has sufficient USDC balance</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>Check that your wallet is connected to Solana mainnet</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>Try using a different browser or wallet</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">→</span>
              <span>
                Contact support at{" "}
                <a
                  href="mailto:support@pattpay.com"
                  className="text-brand hover:text-brand-600 underline"
                >
                  support@pattpay.com
                </a>
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-600
                     text-white font-mono text-sm py-3 px-6 rounded-lg
                     transition-colors duration-200"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Try Again
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
