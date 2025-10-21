"use client";

import { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  disabled?: boolean;
}

interface ValidationState {
  name: { valid: boolean; message?: string };
  email: { valid: boolean; message?: string };
}

export default function CheckoutForm({
  name,
  email,
  onNameChange,
  onEmailChange,
  disabled = false,
}: CheckoutFormProps) {
  const [touched, setTouched] = useState({ name: false, email: false });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const validation: ValidationState = {
    name: {
      valid: validateName(name),
      message: !validateName(name) && touched.name ? "Name must be at least 2 characters" : undefined,
    },
    email: {
      valid: validateEmail(email),
      message: !validateEmail(email) && touched.email ? "Please enter a valid email address" : undefined,
    },
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value);
  };

  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
  };

  return (
    <div className="space-y-5">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="text-xs font-mono text-muted uppercase tracking-wide"
        >
          Full Name
        </label>

        <div className="relative">
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            disabled={disabled}
            placeholder="John Doe"
            className={cn(
              "w-full px-4 py-3 bg-surface border-2 rounded-lg",
              "font-mono text-sm text-foreground",
              "transition-all duration-200",
              "placeholder:text-muted",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              !validation.name.valid && touched.name
                ? "border-error focus:ring-2 focus:ring-error/20"
                : validation.name.valid && touched.name
                  ? "border-success focus:ring-2 focus:ring-success/20"
                  : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
            )}
          />

          {/* Success Icon */}
          {validation.name.valid && touched.name && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-success"
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
          )}

          {/* Error Icon */}
          {!validation.name.valid && touched.name && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-error"
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
          )}
        </div>

        {/* Error Message */}
        {validation.name.message && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-error font-mono"
          >
            {validation.name.message}
          </motion.p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-xs font-mono text-muted uppercase tracking-wide"
        >
          Email Address
        </label>

        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            disabled={disabled}
            placeholder="you@example.com"
            className={cn(
              "w-full px-4 py-3 bg-surface border-2 rounded-lg",
              "font-mono text-sm text-foreground",
              "transition-all duration-200",
              "placeholder:text-muted",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              !validation.email.valid && touched.email
                ? "border-error focus:ring-2 focus:ring-error/20"
                : validation.email.valid && touched.email
                  ? "border-success focus:ring-2 focus:ring-success/20"
                  : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
            )}
          />

          {/* Success Icon */}
          {validation.email.valid && touched.email && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-success"
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
          )}

          {/* Error Icon */}
          {!validation.email.valid && touched.email && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-error"
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
          )}
        </div>

        {/* Error Message */}
        {validation.email.message && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-error font-mono"
          >
            {validation.email.message}
          </motion.p>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="flex gap-2 p-3 bg-brand/5 border border-brand/20 rounded">
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p className="text-xs text-muted font-mono">
          Your information is encrypted and never shared with third parties
        </p>
      </div>
    </div>
  );
}
