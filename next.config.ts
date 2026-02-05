import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['smartapi-javascript', 'yahoo-finance2'],
  // @ts-ignore
  turbopack: {
    resolveAlias: {
      electron: 'false',
    },
  },
  webpack: (config) => {
    config.externals.push('electron');
    return config;
  },
};

export default nextConfig;
