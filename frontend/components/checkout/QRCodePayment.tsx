"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "react-qr-code";
import { cn } from "@/lib/utils";

interface QRCodePaymentProps {
  paymentAddress: string;
  show: boolean;
}

export default function QRCodePayment({
  paymentAddress,
  show,
}: QRCodePaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: 20, height: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="mt-6 p-6 bg-surface border-2 border-brand/20 rounded-lg">
            {/* Title */}
            <div className="text-center mb-4">
              <h3 className="font-display text-sm text-foreground mb-1">
                Scan to Pay
              </h3>
              <p className="text-xs text-muted font-mono">
                Use your wallet app to scan the QR code
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block p-4 bg-white rounded-lg shadow-sm"
              >
                <QRCodeSVG
                  value={paymentAddress}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </motion.div>
            </div>

            {/* Payment Address */}
            <div className="space-y-2">
              <p className="text-xs text-muted font-mono text-center">
                Or copy the payment address
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={paymentAddress}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded text-xs font-mono text-foreground overflow-x-auto scrollbar-hide"
                />

                <motion.button
                  type="button"
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-3 py-2 rounded font-mono text-xs transition-all duration-200",
                    "flex items-center gap-1.5",
                    copied
                      ? "bg-success text-white"
                      : "bg-brand text-white hover:bg-brand-600"
                  )}
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-4 h-4"
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
                      Copied
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-brand/5 border border-brand/20 rounded">
              <div className="flex gap-2 text-xs font-mono text-foreground">
                <svg
                  className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
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
                <div className="space-y-1">
                  <p className="font-medium">Payment will be automatic</p>
                  <p className="text-muted">
                    Once you scan and approve, the subscription will be
                    activated instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
