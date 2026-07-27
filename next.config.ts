import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security-headers";

function getR2ImageRemotePattern() {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!publicUrl) return null;

  try {
    const { protocol, hostname } = new URL(publicUrl);
    if (protocol !== "https:" && protocol !== "http:") return null;

    return {
      protocol: protocol.replace(":", "") as "https" | "http",
      hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const r2ImageRemotePattern = getR2ImageRemotePattern();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: r2ImageRemotePattern ? [r2ImageRemotePattern] : [],
  },
  async headers() {
    return [
      {
        // Security headers on every response.
        source: "/:path*",
        headers: buildSecurityHeaders(),
      },
      {
        // Banner photos are static and filenames don't change on edits, so
        // browsers can reuse them from cache indefinitely after first load
        // instead of re-fetching on every visit/interaction.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
