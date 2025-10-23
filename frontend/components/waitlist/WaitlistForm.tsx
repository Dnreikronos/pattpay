"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FormState = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setState("success");
      setEmail("");
    } catch (error) {
      console.error("Waitlist error:", error);
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
      className="w-full max-w-sm mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder="Enter your email"
            disabled={state === "loading" || state === "success"}
            className={`
              flex h-11 w-full rounded-lg border-2
              ${state === "error" ? "border-error focus-visible:border-error" : "border-border focus-visible:border-brand"}
              ${state === "success" ? "border-success" : ""}
              bg-card px-4 py-2
              font-mono text-sm
              placeholder:text-muted-foreground
              text-foreground
              focus-visible:outline-none
              focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]
              hover:border-brand/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          />
        </div>

        <button
          type="submit"
          disabled={state === "loading" || state === "success"}
          className={`
            flex h-11 w-full items-center justify-center
            px-6 py-2
            font-mono text-sm font-medium
            bg-brand text-surface
            rounded-lg
            hover:shadow-[4px_4px_0_0_rgba(129,140,248,1)]
            hover:-translate-x-[2px] hover:-translate-y-[2px]
            active:shadow-[2px_2px_0_0_rgba(129,140,248,1)]
            active:translate-x-[1px] active:translate-y-[1px]
            focus-visible:outline-none
            focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:translate-x-0 disabled:hover:translate-y-0
            disabled:hover:shadow-none
            transition-all duration-150
          `}
        >
          {state === "loading" && "Joining..."}
          {state === "success" && "✓ You're on the list!"}
          {(state === "idle" || state === "error") && "Join Waitlist"}
        </button>

        {state === "error" && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-error text-sm font-mono text-center"
          >
            {errorMessage}
          </motion.p>
        )}

        {state === "success" && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-success text-sm font-mono text-center"
          >
            Check your email for confirmation!
          </motion.p>
        )}
      </form>

      <p className="mt-3 text-xs text-muted-foreground text-center font-mono">
        Join the future of recurring payments on Solana
      </p>
    </motion.div>
  );
}
