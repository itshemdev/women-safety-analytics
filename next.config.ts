import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(process.env.NODE_ENV === "production" && {
    pwa: {
      dest: "public",
      register: true,
      skipWaiting: true,
    },
  }),
};

export default nextConfig;
