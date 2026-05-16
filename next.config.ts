import type { NextConfig } from "next";
import { SIMPLE_REDIRECTS } from "./redirects-legacy";

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
		qualities: [55, 75, 80, 85, 90, 95],
		minimumCacheTTL: 2592000, // 30 jours
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.garagemendonca.com",
			},
			// Supabase Storage (tous projets *.supabase.co)
			{
				protocol: "https",
				hostname: "*.supabase.co",
				pathname: "/storage/v1/object/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "upload.wikimedia.org",
			},
		],
	},

  async redirects() {
    // Vehicle URLs with + (details-...) are handled by middleware.ts
    // (path-to-regexp cannot parse literal + in source patterns)
    return [...SIMPLE_REDIRECTS];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Routes admin : jamais en cache
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
