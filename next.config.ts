import type { NextConfig } from "next";
import { SIMPLE_REDIRECTS } from "./redirects-simple";

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
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
    return [
      {
        source: "/vehicules/page/1",
        destination: "/vehicules",
        permanent: true,
      },
      ...SIMPLE_REDIRECTS,
    ];
  },

  async rewrites() {
    return [
      {
        // Les URLs legacy véhicules (/details-{marque}+{modele}+...html) ne peuvent pas
        // être gérées dans redirects() car path-to-regexp interprète + comme quantificateur.
        // Solution : rewrite vers un route handler qui fait le 301, sans passer par
        // le middleware Edge Runtime (évite de sérialiser le VEHICLE_PATH_MAP dans le bundle Edge).
        source: "/:slug(details-[^/]+)",
        destination: "/api/lr/:slug",
      },
    ];
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
        // Assets statiques Next.js — immuables (hash dans le nom de fichier)
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Images publiques statiques (/images/, /icons/, /fonts/)
        source: "/(images|icons|fonts)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Pages ISR véhicules — CDN cache 60 s, revalidation en arrière-plan
        source: "/vehicules/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=3600" },
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
