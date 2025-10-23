"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WalletConnectButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
}

export default function WalletConnectButton({
  isConnected,
  isConnecting,
  walletAddress,
  onConnect,
  onDisconnect,
}: WalletConnectButtonProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isConnected && walletAddress) {
    return (
      <div className="space-y-3">
        <label className="text-xs font-mono text-muted uppercase tracking-wide">
          Wallet Status
        </label>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-success/10 border-2 border-success rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-success rounded-full"
              />
              <span className="font-mono text-sm font-medium text-foreground">
                Connected
              </span>
            </div>
            <span className="font-mono text-xs text-muted">
              {truncateAddress(walletAddress)}
            </span>
          </div>

          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="mt-3 w-full py-2 text-xs font-mono text-muted hover:text-foreground transition-colors"
            >
              Disconnect
            </button>
          )}
        </motion.div>

        {/* Supported Wallets Info */}
        <div className="grid grid-cols-4 gap-2">
          {["Phantom", "Solflare", "Backpack", "Ledger"].map((wallet) => (
            <div
              key={wallet}
              className="px-2 py-1.5 bg-surface border border-border rounded text-[10px] font-mono text-center text-muted"
            >
              {wallet}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-mono text-muted uppercase tracking-wide">
        Connect Wallet
      </label>

      <motion.button
        type="button"
        onClick={onConnect}
        disabled={isConnecting}
        whileHover={!isConnecting ? { x: -2, y: -2 } : {}}
        whileTap={!isConnecting ? { x: 1, y: 1 } : {}}
        className={cn(
          "w-full py-4 px-6 rounded-lg font-mono text-sm transition-all duration-150",
          "flex items-center justify-center gap-2",
          "disabled:cursor-not-allowed disabled:opacity-70",
          !isConnecting &&
            "bg-brand text-white shadow-[4px_4px_0_0_rgba(129,140,248,1)] hover:shadow-[6px_6px_0_0_rgba(129,140,248,1)] active:shadow-[2px_2px_0_0_rgba(129,140,248,1)]"
        )}
      >
        {isConnecting ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Connect Solana Wallet
          </>
        )}
      </motion.button>

      {/* Supported Wallets */}
      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted font-mono mb-2">Supported wallets</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Phantom", logo: "👻" },
            { name: "Solflare", logo: "🔥" },
            { name: "Backpack", logo: "🎒" },
            { name: "Ledger", logo: "🔐" },
          ].map((wallet) => (
            <div
              key={wallet.name}
              className="px-3 py-2 bg-surface border border-border rounded text-xs font-mono text-foreground flex items-center gap-2"
            >
              <span>{wallet.logo}</span>
              <span>{wallet.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
