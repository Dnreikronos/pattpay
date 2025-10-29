"use client";

import { motion } from "framer-motion";

type CloudType = "small" | "medium" | "large";
type CloudColor = "brand" | "brand-300" | "accent";

interface Cloud {
  type: CloudType;
  top: string;
  delay: number;
  duration: number;
  opacity: number;
  color: CloudColor;
}

const getCloudSVG = (type: CloudType, color: CloudColor) => {
  const colorSchemes = {
    brand: {
      highlight: "#F5F2FA",
      light: "#E8E3F0",
      mid: "#D4C9E0",
      dark: "#C2B5D4",
      shadow: "#B0A1C7",
      outline: "#9A8BB8",
    },
    "brand-300": {
      highlight: "#F0F2FF",
      light: "#E0E5FF",
      mid: "#C5D0FF",
      dark: "#AABDFF",
      shadow: "#8FA9FF",
      outline: "#7493FF",
    },
    accent: {
      highlight: "#FFF9ED",
      light: "#FFF3D9",
      mid: "#FFE8B8",
      dark: "#FFDD99",
      shadow: "#FFD27A",
      outline: "#F2B94B",
    },
  };

  const colors = colorSchemes[color];
  const scale = type === "large" ? 1.2 : type === "medium" ? 0.9 : 0.6;
  const width = 200 * scale;
  const height = 120 * scale;

  return (
    <svg width={width} height={height} viewBox="0 0 200 120" className="pixelated">
      <defs>
        <style>{`
          .cloud-highlight-${color} { fill: ${colors.highlight}; }
          .cloud-light-${color} { fill: ${colors.light}; }
          .cloud-mid-${color} { fill: ${colors.mid}; }
          .cloud-dark-${color} { fill: ${colors.dark}; }
          .cloud-shadow-${color} { fill: ${colors.shadow}; }
          .cloud-outline-${color} { fill: ${colors.outline}; }
        `}</style>
      </defs>

      <g className={`cloud-outline-${color}`}>
        {/* Base */}
        <rect x="24" y="88" width="8" height="8"/><rect x="32" y="88" width="8" height="8"/><rect x="40" y="88" width="8" height="8"/>
        <rect x="48" y="88" width="8" height="8"/><rect x="56" y="88" width="8" height="8"/><rect x="64" y="88" width="8" height="8"/>
        <rect x="72" y="88" width="8" height="8"/><rect x="80" y="88" width="8" height="8"/><rect x="88" y="88" width="8" height="8"/>
        <rect x="96" y="88" width="8" height="8"/><rect x="104" y="88" width="8" height="8"/><rect x="112" y="88" width="8" height="8"/>
        <rect x="120" y="88" width="8" height="8"/><rect x="128" y="88" width="8" height="8"/><rect x="136" y="88" width="8" height="8"/>
        <rect x="144" y="88" width="8" height="8"/><rect x="152" y="88" width="8" height="8"/><rect x="160" y="88" width="8" height="8"/>
        <rect x="168" y="88" width="8" height="8"/>
        {/* Sides */}
        <rect x="16" y="80" width="8" height="8"/><rect x="8" y="72" width="8" height="8"/><rect x="8" y="64" width="8" height="8"/>
        <rect x="8" y="56" width="8" height="8"/><rect x="16" y="48" width="8" height="8"/>
        <rect x="176" y="80" width="8" height="8"/><rect x="184" y="72" width="8" height="8"/><rect x="184" y="64" width="8" height="8"/>
        <rect x="184" y="56" width="8" height="8"/><rect x="176" y="48" width="8" height="8"/>
        {/* Tops */}
        <rect x="24" y="40" width="8" height="8"/><rect x="32" y="32" width="8" height="8"/><rect x="40" y="24" width="8" height="8"/>
        <rect x="48" y="24" width="8" height="8"/><rect x="56" y="32" width="8" height="8"/>
        <rect x="72" y="32" width="8" height="8"/><rect x="80" y="24" width="8" height="8"/><rect x="88" y="16" width="8" height="8"/>
        <rect x="96" y="16" width="8" height="8"/><rect x="104" y="24" width="8" height="8"/>
        <rect x="120" y="24" width="8" height="8"/><rect x="128" y="16" width="8" height="8"/><rect x="136" y="8" width="8" height="8"/>
        <rect x="144" y="8" width="8" height="8"/><rect x="152" y="16" width="8" height="8"/><rect x="160" y="24" width="8" height="8"/>
        <rect x="168" y="32" width="8" height="8"/>
      </g>

      {/* Shadow layer */}
      <g className={`cloud-shadow-${color}`}>
        <rect x="24" y="80" width="8" height="8"/><rect x="32" y="80" width="8" height="8"/><rect x="40" y="80" width="8" height="8"/>
        <rect x="48" y="80" width="8" height="8"/><rect x="56" y="80" width="8" height="8"/><rect x="64" y="80" width="8" height="8"/>
        <rect x="72" y="80" width="8" height="8"/><rect x="80" y="80" width="8" height="8"/><rect x="88" y="80" width="8" height="8"/>
        <rect x="96" y="80" width="8" height="8"/><rect x="104" y="80" width="8" height="8"/><rect x="112" y="80" width="8" height="8"/>
        <rect x="120" y="80" width="8" height="8"/><rect x="128" y="80" width="8" height="8"/><rect x="136" y="80" width="8" height="8"/>
        <rect x="144" y="80" width="8" height="8"/><rect x="152" y="80" width="8" height="8"/><rect x="160" y="80" width="8" height="8"/>
        <rect x="168" y="80" width="8" height="8"/>
        <rect x="16" y="72" width="8" height="8"/><rect x="16" y="64" width="8" height="8"/><rect x="16" y="56" width="8" height="8"/>
        <rect x="24" y="48" width="8" height="8"/>
        <rect x="176" y="72" width="8" height="8"/><rect x="176" y="64" width="8" height="8"/><rect x="176" y="56" width="8" height="8"/>
        <rect x="168" y="48" width="8" height="8"/>
        <rect x="32" y="40" width="8" height="8"/><rect x="40" y="32" width="8" height="8"/><rect x="48" y="32" width="8" height="8"/>
        <rect x="80" y="32" width="8" height="8"/><rect x="88" y="24" width="8" height="8"/><rect x="96" y="24" width="8" height="8"/>
        <rect x="128" y="24" width="8" height="8"/><rect x="136" y="16" width="8" height="8"/><rect x="144" y="16" width="8" height="8"/>
        <rect x="152" y="24" width="8" height="8"/><rect x="160" y="32" width="8" height="8"/>
      </g>

      {/* Dark layer */}
      <g className={`cloud-dark-${color}`}>
        <rect x="16" y="72" width="144" height="8"/>
        <rect x="16" y="64" width="8" height="8"/><rect x="16" y="56" width="8" height="8"/><rect x="24" y="48" width="8" height="8"/>
        <rect x="176" y="64" width="8" height="8"/><rect x="176" y="56" width="8" height="8"/><rect x="168" y="48" width="8" height="8"/>
        <rect x="24" y="56" width="8" height="8"/><rect x="32" y="48" width="8" height="8"/><rect x="40" y="40" width="8" height="8"/>
        <rect x="48" y="40" width="8" height="8"/><rect x="56" y="48" width="8" height="8"/><rect x="64" y="56" width="8" height="8"/>
        <rect x="72" y="48" width="8" height="8"/><rect x="80" y="40" width="8" height="8"/><rect x="88" y="32" width="8" height="8"/>
        <rect x="96" y="32" width="8" height="8"/><rect x="104" y="40" width="8" height="8"/><rect x="112" y="48" width="8" height="8"/>
        <rect x="120" y="40" width="8" height="8"/><rect x="128" y="32" width="8" height="8"/><rect x="136" y="24" width="8" height="8"/>
        <rect x="144" y="24" width="8" height="8"/><rect x="152" y="32" width="8" height="8"/><rect x="160" y="40" width="8" height="8"/>
      </g>

      {/* Mid layer */}
      <g className={`cloud-mid-${color}`}>
        <rect x="16" y="64" width="160" height="8"/>
        <rect x="16" y="56" width="8" height="8"/><rect x="24" y="48" width="8" height="8"/><rect x="168" y="48" width="8" height="8"/>
        <rect x="176" y="56" width="8" height="8"/>
        <rect x="24" y="56" width="8" height="8"/><rect x="32" y="48" width="8" height="8"/><rect x="40" y="40" width="8" height="8"/>
        <rect x="48" y="40" width="8" height="8"/><rect x="56" y="48" width="8" height="8"/><rect x="64" y="56" width="8" height="8"/>
        <rect x="72" y="48" width="8" height="8"/><rect x="80" y="40" width="8" height="8"/><rect x="88" y="32" width="8" height="8"/>
        <rect x="96" y="32" width="8" height="8"/><rect x="104" y="40" width="8" height="8"/><rect x="112" y="48" width="8" height="8"/>
        <rect x="120" y="40" width="8" height="8"/><rect x="128" y="32" width="8" height="8"/><rect x="136" y="24" width="8" height="8"/>
        <rect x="144" y="24" width="8" height="8"/><rect x="152" y="32" width="8" height="8"/><rect x="160" y="40" width="8" height="8"/>
      </g>

      {/* Light layer */}
      <g className={`cloud-light-${color}`}>
        <rect x="16" y="56" width="160" height="8"/>
        <rect x="24" y="48" width="8" height="8"/><rect x="168" y="48" width="8" height="8"/>
        <rect x="32" y="48" width="8" height="8"/><rect x="40" y="40" width="8" height="8"/><rect x="48" y="40" width="8" height="8"/>
        <rect x="56" y="48" width="8" height="8"/>
        <rect x="72" y="48" width="8" height="8"/><rect x="80" y="40" width="8" height="8"/><rect x="88" y="32" width="8" height="8"/>
        <rect x="96" y="32" width="8" height="8"/><rect x="104" y="40" width="8" height="8"/><rect x="112" y="48" width="8" height="8"/>
        <rect x="120" y="40" width="8" height="8"/><rect x="128" y="32" width="8" height="8"/><rect x="136" y="24" width="8" height="8"/>
        <rect x="144" y="24" width="8" height="8"/><rect x="152" y="32" width="8" height="8"/><rect x="160" y="40" width="8" height="8"/>
      </g>

      {/* Highlight layer */}
      <g className={`cloud-highlight-${color}`}>
        <rect x="32" y="40" width="8" height="8"/><rect x="40" y="32" width="8" height="8"/><rect x="48" y="32" width="8" height="8"/>
        <rect x="56" y="40" width="8" height="8"/>
        <rect x="80" y="32" width="8" height="8"/><rect x="88" y="24" width="8" height="8"/><rect x="96" y="24" width="8" height="8"/>
        <rect x="104" y="32" width="8" height="8"/>
        <rect x="128" y="24" width="8" height="8"/><rect x="136" y="16" width="8" height="8"/><rect x="144" y="16" width="8" height="8"/>
        <rect x="152" y="24" width="8" height="8"/>
      </g>
    </svg>
  );
};

export default function PixelClouds() {
  const clouds: Cloud[] = [
    // Layer 1 - Background (slow, large, very transparent)
    { type: "large", top: "8%", delay: 0, duration: 100, opacity: 0.08, color: "brand" },
    { type: "large", top: "45%", delay: 30, duration: 110, opacity: 0.1, color: "brand-300" },
    { type: "large", top: "78%", delay: 60, duration: 95, opacity: 0.09, color: "brand" },
    { type: "large", top: "22%", delay: 45, duration: 105, opacity: 0.07, color: "accent" },
    { type: "large", top: "62%", delay: 15, duration: 100, opacity: 0.09, color: "brand-300" },

    // Layer 2 - Middle (medium speed and size)
    { type: "medium", top: "15%", delay: 10, duration: 65, opacity: 0.15, color: "brand-300" },
    { type: "medium", top: "32%", delay: 25, duration: 70, opacity: 0.12, color: "brand" },
    { type: "medium", top: "55%", delay: 40, duration: 60, opacity: 0.14, color: "accent" },
    { type: "medium", top: "70%", delay: 15, duration: 68, opacity: 0.13, color: "brand-300" },
    { type: "medium", top: "88%", delay: 50, duration: 72, opacity: 0.15, color: "brand" },
    { type: "medium", top: "5%", delay: 35, duration: 62, opacity: 0.13, color: "brand" },
    { type: "medium", top: "40%", delay: 8, duration: 66, opacity: 0.14, color: "brand-300" },
    { type: "medium", top: "75%", delay: 28, duration: 64, opacity: 0.12, color: "accent" },
    { type: "medium", top: "92%", delay: 45, duration: 70, opacity: 0.14, color: "brand-300" },

    // Layer 3 - Foreground (fast, small, more visible)
    { type: "small", top: "12%", delay: 5, duration: 40, opacity: 0.2, color: "brand" },
    { type: "small", top: "28%", delay: 18, duration: 38, opacity: 0.22, color: "accent" },
    { type: "small", top: "48%", delay: 35, duration: 42, opacity: 0.18, color: "brand-300" },
    { type: "small", top: "63%", delay: 8, duration: 45, opacity: 0.25, color: "brand" },
    { type: "small", top: "82%", delay: 28, duration: 36, opacity: 0.2, color: "brand-300" },
    { type: "small", top: "3%", delay: 12, duration: 44, opacity: 0.21, color: "brand-300" },
    { type: "small", top: "20%", delay: 30, duration: 38, opacity: 0.19, color: "brand" },
    { type: "small", top: "38%", delay: 22, duration: 40, opacity: 0.23, color: "accent" },
    { type: "small", top: "52%", delay: 15, duration: 43, opacity: 0.2, color: "brand-300" },
    { type: "small", top: "68%", delay: 33, duration: 37, opacity: 0.24, color: "brand" },
    { type: "small", top: "85%", delay: 6, duration: 41, opacity: 0.22, color: "accent" },
    { type: "small", top: "95%", delay: 20, duration: 39, opacity: 0.21, color: "brand-300" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((cloud, index) => {
        // Calculate initial X position based on delay to spread clouds
        // Each cloud starts at a position proportional to its delay
        const totalDuration = cloud.duration;
        const initialXPercent = -20 + (cloud.delay / totalDuration) * 140; // Spread from -20% to 120%

        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              top: cloud.top,
              opacity: cloud.opacity,
            }}
            initial={{ x: `${initialXPercent}vw` }}
            animate={{
              x: "120vw",
              y: [0, -10, 0] // Subtle vertical float
            }}
            transition={{
              x: {
                duration: cloud.duration,
                delay: 0, // No delay needed, start immediately from spread position
                repeat: Infinity,
                ease: "linear",
              },
              y: {
                duration: cloud.duration / 3,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          >
            {getCloudSVG(cloud.type, cloud.color)}
          </motion.div>
        );
      })}
    </div>
  );
}
