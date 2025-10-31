"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WalletConnectButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
  disabled?: boolean;
}

export default function WalletConnectButton({
  isConnected,
  isConnecting,
  walletAddress,
  onConnect,
  onDisconnect,
  disabled = false,
}: WalletConnectButtonProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isConnected && walletAddress) {
    return (
      <div className="space-y-3">
        <label className="text-xs font-mono text-muted uppercase tracking-wide">
          Wallet Connected
        </label>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg border-2 border-success bg-gradient-to-br from-success/5 to-success/10"
        >
          {/* Main Content */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Phantom Logo Official */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AB9FF2] to-[#9880E8] p-2 flex items-center justify-center shadow-lg">
                  <img
                    src="https://phantom.app/img/phantom-icon-purple.png"
                    alt="Phantom"
                    className="w-full h-full"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-2xl">👻</span>';
                      }
                    }}
                  />
                </div>
                {/* Success Badge */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-surface flex items-center justify-center"
                >
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    Phantom
                  </span>
                  <span className="px-2 py-0.5 bg-success/20 text-success text-[10px] font-mono rounded-full font-medium">
                    CONNECTED
                  </span>
                </div>
                <div className="font-mono text-xs text-muted break-all">
                  {truncateAddress(walletAddress)}
                </div>
              </div>
            </div>
          </div>

          {/* Disconnect Button */}
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="w-full px-4 py-2.5 bg-surface/50 hover:bg-surface border-t border-success/20 text-xs font-mono text-muted hover:text-foreground transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Disconnect Wallet
            </button>
          )}
        </motion.div>
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
        disabled={isConnecting || disabled}
        whileHover={!isConnecting && !disabled ? { x: -2, y: -2 } : {}}
        whileTap={!isConnecting && !disabled ? { x: 1, y: 1 } : {}}
        className={cn(
          "w-full py-4 px-6 rounded-lg font-mono text-sm transition-all duration-150",
          "flex items-center justify-center gap-3",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !isConnecting &&
            !disabled &&
            "bg-[#AB9FF2] hover:bg-[#9880E8] text-white shadow-[4px_4px_0_0_rgba(129,140,248,1)] hover:shadow-[6px_6px_0_0_rgba(129,140,248,1)] active:shadow-[2px_2px_0_0_rgba(129,140,248,1)]",
          disabled && "bg-muted text-muted-foreground"
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
            Connecting to Phantom...
          </>
        ) : (
          <>
            {/* Phantom Icon Official */}
            <img
              src="https://phantom.app/img/phantom-icon-purple.png"
              alt="Phantom"
              className="w-6 h-6"
              onError={(e) => {
                // Fallback to emoji if image fails
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && parent.children.length === 2) {
                  const span = document.createElement("span");
                  span.className = "text-xl";
                  span.textContent = "👻";
                  parent.insertBefore(span, parent.firstChild);
                }
              }}
            />
            Connect Phantom Wallet
          </>
        )}
      </motion.button>

      {/* Info sobre Phantom */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted font-mono">Powered by Phantom</p>
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand hover:text-brand-600 font-mono transition-colors"
          >
            Get Phantom →
          </a>
        </div>
      </div>
    </div>
  );
}
