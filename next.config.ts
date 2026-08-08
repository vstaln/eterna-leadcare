// next.config.ts — Next.js config: standalone output (for the Docker
// runner image) and route redirects.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/ops",
        destination: "/#dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
