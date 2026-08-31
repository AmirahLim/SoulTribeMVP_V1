/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@soul-tribe/ui', '@soul-tribe/tokens', '@soul-tribe/core'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
