import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Enable experimental features if needed
  experimental: {
    // Add experimental features here as needed
  },
};

export default nextConfig;
