"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

interface ForceThemeProps {
  theme: "light" | "dark";
}

export function ForceTheme({ theme }: ForceThemeProps) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return null;
}
