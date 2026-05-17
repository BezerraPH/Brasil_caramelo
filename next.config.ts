import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // URLs legadas (posts antigos no Uploadthing) continuam funcionando
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/**" },
    ],
  },
};

export default nextConfig;
