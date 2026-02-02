import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  // remark-gfm not compatible with Turbopack
  // Using react-markdown for table rendering instead
});

export default withMDX(nextConfig);
