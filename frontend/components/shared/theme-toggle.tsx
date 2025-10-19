"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = theme === "dark";
    const newTheme = isDark ? "light" : "dark";

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Get button position for animation origin
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      setTheme(newTheme);
      return;
    }

    // Calculate the radius needed to cover the entire viewport from the button
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Start the view transition
    const transition = document.startViewTransition(async () => {
      setTheme(newTheme);
    });

    // Wait for the transition to be ready
    try {
      await transition.ready;

      // Create circular reveal animation
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } catch (error) {
      // If transition is skipped or fails, do nothing
      console.log("Theme transition skipped");
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="relative cursor-pointer">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="sm"
      className="relative cursor-pointer group"
      onClick={handleThemeChange}
      aria-label="Toggle theme"
    >
      {/* Light mode: show Sun, on hover show Moon | Dark mode: hide Sun, on hover show Sun */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all group-hover:rotate-90 group-hover:scale-0 dark:-rotate-90 dark:scale-0 dark:group-hover:rotate-0 dark:group-hover:scale-100 text-foreground" />

      {/* Light mode: hide Moon, on hover show Moon | Dark mode: show Moon, on hover hide Moon */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all group-hover:rotate-0 group-hover:scale-100 dark:rotate-0 dark:scale-100 dark:group-hover:rotate-90 dark:group-hover:scale-0 text-foreground" />
    </Button>
  );
}
