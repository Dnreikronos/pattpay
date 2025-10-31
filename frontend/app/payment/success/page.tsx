"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const txSignature = searchParams.get("tx");
  const amount = searchParams.get("amount");
  const token = searchParams.get("token") || "USDC";
  const type = searchParams.get("type") || "one-time"; // "one-time" or "subscription"
  const redirectUrl = searchParams.get("redirect");
  const merchantName = searchParams.get("merchant");

  // Countdown for redirect
  useEffect(() => {
    if (!redirectUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Success Icon */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-6"
          >
            <svg
              className="h-12 w-12 text-success"
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

          <h1 className="font-display text-2xl md:text-3xl text-foreground mb-3">
            {type === "subscription" ? "Subscription Activated!" : "Payment Successful!"}
          </h1>
          <p className="text-base font-mono text-muted max-w-lg mx-auto">
            {type === "subscription"
              ? "Your recurring payment has been set up successfully. Smart contracts will handle the rest automatically."
              : "Your payment has been processed successfully on the Solana blockchain."}
          </p>
        </div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface border-2 border-border rounded-lg p-6 space-y-4"
        >
          <h2 className="text-xs font-mono text-muted uppercase tracking-wide mb-4">
            Transaction Details
          </h2>

          {amount && (
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm font-mono text-muted">Amount</span>
              <span className="text-lg font-mono text-foreground font-semibold">
                {amount} {token}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-sm font-mono text-muted">Type</span>
            <span className="text-sm font-mono text-foreground">
              {type === "subscription" ? "Recurring Subscription" : "One-Time Payment"}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-sm font-mono text-muted">Status</span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-success/20 text-success text-xs font-mono rounded-full font-medium">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Confirmed
            </span>
          </div>

          {txSignature && (
            <div className="pt-2">
              <p className="text-xs text-muted font-mono mb-2">Transaction Signature</p>
              <div className="bg-background border border-border rounded p-3 mb-3">
                <p className="text-xs font-mono text-foreground break-all">
                  {txSignature}
                </p>
              </div>
              <a
                href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-brand hover:text-brand-600 transition-colors"
              >
                View on Solscan
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </motion.div>

        {/* What's Next */}
        {type === "subscription" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-brand/5 border border-brand/20 rounded-lg p-6 space-y-4"
          >
            <h2 className="font-display text-sm text-foreground">What happens next?</h2>
            <ul className="space-y-2 text-xs font-mono text-muted">
              <li className="flex gap-2">
                <span className="text-brand">→</span>
                <span>Payments will be processed automatically each billing cycle</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand">→</span>
                <span>You&apos;ll receive notifications before each charge</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand">→</span>
                <span>Cancel anytime directly from your wallet</span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* Redirect Notice */}
        {redirectUrl && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-surface border border-border rounded-lg p-4 text-center"
          >
            <p className="text-sm font-mono text-muted">
              {merchantName ? `Redirecting back to ${merchantName}` : "Redirecting"} in{" "}
              <span className="text-brand font-semibold">{countdown}</span> seconds...
            </p>
          </motion.div>
        )}

        {/* Actions */}
        {!redirectUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-600 text-white font-mono text-sm py-3 px-6 rounded-lg transition-all duration-150 shadow-[4px_4px_0_0_rgba(79,70,229,0.3)] hover:shadow-[6px_6px_0_0_rgba(79,70,229,0.3)] active:shadow-[2px_2px_0_0_rgba(79,70,229,0.3)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[1px] active:translate-y-[1px]"
            >
              Back to Home
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-8">
            <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full animate-pulse" />
            <div className="space-y-3">
              <div className="h-8 bg-muted/20 rounded w-64 mx-auto animate-pulse" />
              <div className="h-4 bg-muted/20 rounded w-96 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
