"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import TokenSelector, { type TokenType } from "@/components/checkout/TokenSelector";
import WalletConnectButton from "@/components/checkout/WalletConnectButton";
import { usePublicLinkQuery } from "@/lib/hooks/useLinkQueries";
import { useWallet } from "@/lib/hooks/useWallet";
import { isPhantomInstalled, getPhantomInstallUrl } from "@/lib/utils/wallet";
import {
  useSubscribe,
  useCreatePaymentExecution,
} from "@/lib/hooks/usePaymentMutations";
import { DuplicatePaymentError } from "@/lib/types/payment";

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  // Unwrap params using React.use()
  const { id } = React.use(params);

  // Fetch payment link data
  const { data, isLoading, error } = usePublicLinkQuery(id);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC");

  // Payment mutations
  const subscribeMutation = useSubscribe();
  const paymentExecutionMutation = useCreatePaymentExecution();

  // Combined loading state
  const isProcessing =
    subscribeMutation.isPending || paymentExecutionMutation.isPending;

  // Wallet integration - Real Phantom wallet connection
  const {
    publicKey: walletAddress,
    isConnected,
    isConnecting,
    error: walletError,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useWallet();

  // Show loading state
  if (isLoading) {
    return null; // loading.tsx will be shown
  }

  // Handle errors or missing data
  if (error || !data?.link) {
    notFound();
  }

  const link = data.link;

  // Check if link is active
  if (link.status !== "active") {
    notFound();
  }

  // Check if link is expired
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    notFound();
  }

  // Get token price for selected token
  const selectedTokenPrice = link.tokenPrices.find(
    (tp) => tp.token === selectedToken
  );

  // Calculate amount to display
  const amount = selectedTokenPrice?.price || "0";

  // Determine merchant name (use receiver name or fallback)
  const merchantName = link.receiver?.name || "Merchant";

  // Determine billing cycle
  const billingCycle = link.isRecurring
    ? link.durationMonths === 1
      ? ("monthly" as const)
      : link.durationMonths === 12
      ? ("yearly" as const)
      : ("monthly" as const)
    : ("one-time" as const);

  const handleConnectWallet = async () => {
    // Validate name first
    if (!name.trim()) {
      // Focus on name input to make it clear what's needed
      const nameInput = document.getElementById("name");
      if (nameInput) {
        nameInput.focus();
        // Add shake animation
        nameInput.classList.add("animate-shake");
        setTimeout(() => nameInput.classList.remove("animate-shake"), 500);
      }

      toast.error("Name Required", {
        description: "Please enter your name before connecting wallet",
      });
      return;
    }

    // Check if Phantom is installed
    if (!isPhantomInstalled()) {
      toast.error("Phantom Not Found", {
        description: "Please install Phantom wallet to continue",
        action: {
          label: "Install",
          onClick: () => window.open(getPhantomInstallUrl(), "_blank"),
        },
      });
      return;
    }

    try {
      await connectWallet();
      toast.success("Wallet Connected", {
        description: "Your Phantom wallet has been connected successfully",
      });
    } catch {
      // Error is already handled by useWallet hook
      // Just show a toast if there's a wallet error
      if (walletError) {
        if (walletError.code === "USER_REJECTED") {
          toast.error("Connection Rejected", {
            description: walletError.message,
          });
        } else {
          toast.error("Connection Failed", {
            description: walletError.message || "Failed to connect to Phantom wallet",
          });
        }
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast.info("Wallet Disconnected", {
        description: "Your wallet has been disconnected",
      });
    } catch {
      toast.error("Disconnection Failed", {
        description: "Failed to disconnect wallet",
      });
    }
  };

  const handleTokenChange = (token: TokenType) => {
    setSelectedToken(token);
  };

  const handleRecurringPayment = async () => {
    console.log("=== Starting Recurring Payment ===");
    console.log("Wallet Address:", walletAddress);
    console.log("Selected Token:", selectedToken);
    console.log("Selected Token Price:", selectedTokenPrice);

    if (!selectedTokenPrice) {
      toast.error("Invalid token selected");
      return;
    }

    if (!link.receiver?.walletAddress) {
      toast.error("Receiver wallet not found");
      return;
    }

    try {
      // Generate subscription ID
      const subscriptionId = crypto.randomUUID();

      // Calculate approved amount (price * duration)
      const approvedAmount =
        parseFloat(selectedTokenPrice.price) * (link.durationMonths || 1);

      const result = await subscribeMutation.mutateAsync({
        name,
        email: email || undefined,
        planId: link.id,
        tokenMint: selectedTokenPrice.tokenMint,
        tokenDecimals: selectedTokenPrice.tokenDecimals,
        subscriptionId,
        approvedAmount,
        receiverWallet: link.receiver.walletAddress,
      });

      console.log("Subscription result:", result);

      // Build success page URL with query params
      const params = new URLSearchParams({
        tx: result.onChainResult.txSignature,
        amount: selectedTokenPrice.price,
        token: selectedToken,
        type: "subscription",
        merchant: link.receiver?.name || "Merchant",
      });

      if (link.redirectUrl) {
        params.set("redirect", link.redirectUrl);
      }

      // Navigate to success page
      window.location.href = `/payment/success?${params.toString()}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to activate subscription";
      toast.error("Subscription Failed", {
        description: errorMessage,
      });
    }
  };

  const handleOneTimePayment = async () => {
    console.log("=== Starting One-Time Payment ===");
    console.log("Wallet Address:", walletAddress);
    console.log("Selected Token:", selectedToken);
    console.log("Selected Token Price:", selectedTokenPrice);
    console.log("Receiver Wallet:", link.receiver?.walletAddress);

    if (!selectedTokenPrice) {
      toast.error("Invalid token selected");
      return;
    }

    if (!link.receiver?.walletAddress) {
      toast.error("Receiver wallet not found");
      return;
    }

    try {
      console.log("Calling paymentExecutionMutation.mutateAsync...");
      const result = await paymentExecutionMutation.mutateAsync({
        planId: link.id,
        tokenMint: selectedTokenPrice.tokenMint,
        tokenDecimals: selectedTokenPrice.tokenDecimals,
        amount: parseFloat(selectedTokenPrice.price),
        receiverWallet: link.receiver.walletAddress,
        executedBy: walletAddress || undefined,
      });
      console.log("Payment execution result:", result);

      // Build success page URL with query params
      const params = new URLSearchParams({
        tx: result.onChainResult.txSignature,
        amount: selectedTokenPrice.price,
        token: selectedToken,
        type: "one-time",
        merchant: link.receiver?.name || "Merchant",
      });

      if (link.redirectUrl) {
        params.set("redirect", link.redirectUrl);
      }

      // Navigate to success page
      window.location.href = `/payment/success?${params.toString()}`;
    } catch (error) {
      console.error("Payment error caught:", error);

      // Handle duplicate payment - still redirect to success
      if (error instanceof DuplicatePaymentError) {
        // For duplicate payments, redirect to success (payment was already processed)
        const params = new URLSearchParams({
          amount: selectedTokenPrice.price,
          token: selectedToken,
          type: "one-time",
          merchant: link.receiver?.name || "Merchant",
        });

        if (link.redirectUrl) {
          params.set("redirect", link.redirectUrl);
        }

        window.location.href = `/payment/success?${params.toString()}`;
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to process payment";
      console.error("Error message:", errorMessage);
      toast.error("Payment Failed", {
        description: errorMessage,
      });
    }
  };

  const handleAuthorizePayment = async () => {
    // Validate form
    if (!name.trim()) {
      toast.error("Name is required", {
        description: "Please enter your name to continue",
      });
      return;
    }

    if (!walletAddress) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet first",
      });
      return;
    }

    // Route to correct flow
    if (link.isRecurring) {
      await handleRecurringPayment();
    } else {
      await handleOneTimePayment();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid lg:grid-cols-2 gap-8 lg:gap-12"
      >
        {/* Left Column - Order Summary */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <OrderSummary
            merchantName={merchantName}
            merchantLogo={undefined}
            productName={link.name}
            description={link.description || "Payment for services"}
            amount={amount}
            token={selectedToken}
            billingCycle={billingCycle}
          />
        </div>

        {/* Right Column - Payment Form */}
        <div className="space-y-6">
          <div className="bg-surface border-2 border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="font-display text-lg text-foreground mb-1">
                Payment Details
              </h2>
              <p className="text-xs text-muted font-mono">
                Complete the form to continue
              </p>
            </div>

            {/* Checkout Form */}
            <CheckoutForm
              name={name}
              email={email}
              onNameChange={setName}
              onEmailChange={setEmail}
              disabled={isConnecting}
            />

            {/* Token Selector */}
            <TokenSelector
              selectedToken={selectedToken}
              onTokenChange={handleTokenChange}
              disabled={isConnecting || isConnected}
            />

            {/* Wallet Connect */}
            <WalletConnectButton
              isConnected={isConnected}
              isConnecting={isConnecting}
              walletAddress={walletAddress ?? undefined}
              onConnect={handleConnectWallet}
              onDisconnect={handleDisconnect}
              disabled={false}
            />
          </div>

          {/* Final CTA - Shows after wallet connection */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="button"
                onClick={handleAuthorizePayment}
                disabled={isProcessing || !name.trim()}
                className="w-full py-4 px-6 bg-success hover:bg-success/90
                         text-white font-mono text-base rounded-lg
                         shadow-[4px_4px_0_0_rgba(16,185,129,0.5)]
                         hover:-translate-x-[2px] hover:-translate-y-[2px]
                         active:shadow-[2px_2px_0_0_rgba(16,185,129,0.5)]
                         active:translate-x-[1px] active:translate-y-[1px]
                         transition-all duration-150
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
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
                    Processing...
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {link.isRecurring ? "Authorize Subscription" : "Pay Now"}
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
