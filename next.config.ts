import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  serverExternalPackages: ['smartapi-javascript', 'yahoo-finance2'],
  turbopack: {
    resolveAlias: {
      electron: 'false',
    },
  },
  webpack: (config) => {
    config.externals.push('electron');
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/learn/:path*', destination: '/', permanent: true },
      { source: '/tools/:path*', destination: '/', permanent: true },
      { source: '/admin/:path*', destination: '/', permanent: true },
      { source: '/pulse', destination: '/signals', permanent: true },
    ];
  },
};

export default withPWA(nextConfig);
