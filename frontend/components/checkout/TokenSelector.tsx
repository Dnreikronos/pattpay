"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TokenType = "USDC" | "USDT";

interface TokenSelectorProps {
  selectedToken: TokenType;
  onTokenChange: (token: TokenType) => void;
  disabled?: boolean;
}

const tokens = [
  {
    symbol: "USDC",
    name: "USD Coin",
    network: "Solana",
    color: "#2775CA",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    network: "Solana",
    color: "#26A17B",
  },
] as const;

export default function TokenSelector({
  selectedToken,
  onTokenChange,
  disabled = false,
}: TokenSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-mono text-muted uppercase tracking-wide">
        Select Payment Token
      </label>

      <div className="grid grid-cols-2 gap-3">
        {tokens.map((token) => {
          const isSelected = selectedToken === token.symbol;

          return (
            <motion.button
              key={token.symbol}
              type="button"
              disabled={disabled}
              onClick={() => onTokenChange(token.symbol as TokenType)}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-200",
                "flex flex-col items-center gap-2 font-mono",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected
                  ? "bg-brand/10 border-brand shadow-sm"
                  : "bg-surface border-border hover:border-brand/50"
              )}
            >
              {/* Token Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm",
                  "shadow-sm"
                )}
                style={{ backgroundColor: token.color }}
              >
                {token.symbol.slice(0, 2)}
              </div>

              {/* Token Info */}
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">
                  {token.symbol}
                </div>
                <div className="text-xs text-muted">{token.network}</div>
              </div>

              {/* Selected Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Info text */}
      <p className="text-xs text-muted font-mono">
        Payments are processed on Solana mainnet with low fees
      </p>
    </div>
  );
}
