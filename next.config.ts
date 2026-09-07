import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/downloads/cek-bisnis-:slug-guide.pdf",
        destination: "/api/business-pdf/:slug",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;