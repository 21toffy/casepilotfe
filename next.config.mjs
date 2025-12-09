/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Standalone output for dynamic routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
