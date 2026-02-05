import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Friend's change (needed for Learn section)
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Your change (needed for Stocks section)
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

const withMDX = createMDX({
  // remark-gfm not compatible with Turbopack
  // Using react-markdown for table rendering instead
});

export default withMDX(nextConfig);
