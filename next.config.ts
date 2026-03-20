import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["www.garagemendonca.com"],

		remotePatterns: [
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
