import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [55, 75, 80, 85, 90],
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
        pathname: "/storage/v1/object/public/**",
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
};

export default nextConfig;
