"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { type TokenType } from "./TokenSelector";

interface OrderSummaryProps {
  merchantName: string;
  merchantLogo?: string;
  productName: string;
  description: string;
  amount: string;
  token: TokenType;
  billingCycle: "monthly" | "yearly" | "weekly" | "one-time";
}

const billingCycleLabels = {
  monthly: "per month",
  yearly: "per year",
  weekly: "per week",
  "one-time": "one-time payment",
};

export default function OrderSummary({
  merchantName,
  merchantLogo,
  productName,
  description,
  amount,
  token,
  billingCycle,
}: OrderSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl text-foreground mb-2">
          Complete Purchase
        </h1>
        <p className="text-xs text-muted font-mono">
          Powered by PattPay on Solana
        </p>
      </div>

      {/* Order Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border-2 border-border rounded-lg p-6 space-y-4"
      >
        {/* Merchant Info */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          {merchantLogo ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border border-border">
              <Image
                src={merchantLogo}
                alt={merchantName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
              <span className="font-display text-xs text-brand">
                {merchantName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <p className="text-xs text-muted font-mono mb-0.5">Merchant</p>
            <p className="text-sm font-mono font-medium text-foreground">
              {merchantName}
            </p>
          </div>
        </div>

        {/* Product Info */}
        <div className="pb-4 border-b border-border">
          <p className="text-xs text-muted font-mono mb-1">Product</p>
          <p className="text-base font-mono font-medium text-foreground mb-2">
            {productName}
          </p>
          <p className="text-xs text-muted font-mono leading-relaxed">
            {description}
          </p>
        </div>

        {/* Amount */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-xs text-muted font-mono">Amount</p>
            <div className="text-right">
              <p className="text-2xl font-mono font-medium text-brand">
                {amount} {token}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted font-mono text-right">
            {billingCycleLabels[billingCycle]}
          </p>
        </div>
      </motion.div>

      {/* Payment Info */}
      <div className="bg-brand/5 border border-brand/20 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-xs font-mono text-foreground space-y-1">
            <p className="font-medium">Automatic Recurring Payment</p>
            <p className="text-muted leading-relaxed">
              After authorization, smart contracts will automatically process
              your subscription payment each billing cycle. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Asset */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        <Image
          src="/coin.png"
          alt="Crypto coin"
          width={120}
          height={120}
          className="pixelated opacity-50"
        />
      </motion.div>

      {/* Trust Indicators */}
      <div className="space-y-2 pt-4">
        {[
          { icon: "✓", text: "Secured by Solana smart contracts" },
          { icon: "✓", text: "Your wallet, your control" },
          { icon: "✓", text: "Cancel anytime on-chain" },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex gap-2 text-xs font-mono text-muted"
          >
            <span className="text-success font-bold">{item.icon}</span>
            <span>{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
