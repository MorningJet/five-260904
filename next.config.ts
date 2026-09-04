import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["lunar-javascript"],
  // Hide the Next.js "N" badge during local / phone preview.
  devIndicators: false,
};

export default nextConfig;
