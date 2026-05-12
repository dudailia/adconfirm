import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@adconfirm/ui", "@adconfirm/db"],
};

export default nextConfig;
