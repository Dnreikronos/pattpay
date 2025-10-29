"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function PixelButton({
  children,
  variant = "primary",
  onClick,
  className = "",
  ...props
}: PixelButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Click bounce animation
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);

    // Create ripple effect (only for primary)
    if (variant === "primary") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { id, x, y }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    onClick?.(e);
  };

  const primaryClasses = cn(
    "px-8 py-4 bg-brand text-surface font-mono text-base rounded-lg",
    "hover:shadow-[4px_4px_0_0_rgba(129,140,248,1)] hover:cursor-pointer",
    "hover:-translate-x-[2px] hover:-translate-y-[2px]",
    "active:shadow-[2px_2px_0_0_rgba(129,140,248,1)]",
    "active:translate-x-[1px] active:translate-y-[1px]",
    "transition-all duration-150"
  );

  const secondaryClasses = cn(
    "px-8 py-4 border-2 font-mono text-base rounded-lg bg-transparent",
    "border-[var(--border)] text-[var(--fg)]",
    "hover:border-brand hover:text-brand hover:cursor-pointer",
    "hover:shadow-[4px_4px_0_0_rgba(79,70,229,0.3)]",
    "hover:-translate-x-[2px] hover:-translate-y-[2px]",
    "active:shadow-[2px_2px_0_0_rgba(79,70,229,0.3)]",
    "active:translate-x-[1px] active:translate-y-[1px]",
    "transition-all duration-150"
  );

  return (
    <Button
      asChild
      className={cn(
        "relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "primary" ? primaryClasses : secondaryClasses,
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <motion.button
        animate={isClicked ? { y: [0, 4, -4, 0] } : {}}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}

        {variant === "primary" && ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 8,
              height: 8,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 10, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" className="pixelated">
              <rect x="0" y="0" width="8" height="8" fill="rgba(255,255,255,0.6)" />
            </svg>
          </motion.span>
        ))}
      </motion.button>
    </Button>
  );
}
