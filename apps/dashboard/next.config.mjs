/**
 * Next.js 14.2 does not support `next.config.ts`; this project uses `.mjs` instead.
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  transpilePackages: ["@adconfirm/db"],
};

export default nextConfig;
