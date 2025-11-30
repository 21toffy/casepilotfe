/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Static standalone for deployment
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static export
  },
}

export default nextConfig
