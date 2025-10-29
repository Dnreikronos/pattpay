"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import TokenSelector, { type TokenType } from "@/components/checkout/TokenSelector";
import WalletConnectButton from "@/components/checkout/WalletConnectButton";
import QRCodePayment from "@/components/checkout/QRCodePayment";

export default function CheckoutPage() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC");

  // Wallet state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();

  // Mock data - will be replaced with actual props/params from URL or API
  const checkoutData = {
    merchantName: "Acme Corp",
    merchantLogo: undefined, // Could be "/acme-logo.png"
    productName: "Premium Subscription",
    description: "Access to all premium features including analytics, API access, and priority support",
    amount: "9.99",
    billingCycle: "monthly" as const,
  };

  // Generate mock payment address (in production, this would come from the blockchain)
  const paymentAddress =
    walletAddress ||
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

  const handleConnectWallet = async () => {
    setIsConnecting(true);

    // TODO: Implement actual Solana wallet connection
    // This is a mock implementation
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(undefined);
  };

  const handleTokenChange = (token: TokenType) => {
    setSelectedToken(token);
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
            merchantName={checkoutData.merchantName}
            merchantLogo={checkoutData.merchantLogo}
            productName={checkoutData.productName}
            description={checkoutData.description}
            amount={checkoutData.amount}
            token={selectedToken}
            billingCycle={checkoutData.billingCycle}
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
              walletAddress={walletAddress}
              onConnect={handleConnectWallet}
              onDisconnect={handleDisconnect}
            />
          </div>

          {/* QR Code Payment - Shows after wallet connection */}
          <QRCodePayment
            paymentAddress={paymentAddress}
            show={isConnected}
          />

          {/* Final CTA - Shows after wallet connection */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="button"
                className="w-full py-4 px-6 bg-success hover:bg-success/90
                         text-white font-mono text-base rounded-lg
                         shadow-[4px_4px_0_0_rgba(16,185,129,0.5)]
                         hover:-translate-x-[2px] hover:-translate-y-[2px]
                         active:shadow-[2px_2px_0_0_rgba(16,185,129,0.5)]
                         active:translate-x-[1px] active:translate-y-[1px]
                         transition-all duration-150
                         flex items-center justify-center gap-2"
              >
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
                Authorize Payment
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
