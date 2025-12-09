/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for HTML files
  trailingSlash: true,
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
