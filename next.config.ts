import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
    ],
  },
  // Optimize imports for faster builds and smaller bundles
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
