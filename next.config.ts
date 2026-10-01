import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Report items 255-267 — Vercel terminates HTTPS and redirects HTTP->HTTPS
  // automatically, but does NOT add the Strict-Transport-Security response
  // header on its own; without it, a browser's very first (never-yet-HSTS'd)
  // request to the domain is still made over plain HTTP before any redirect.
  // Bundled with the other zero-config, zero-risk security headers from the
  // same checklist item since they cost nothing and touch no business logic.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
