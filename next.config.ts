import type { NextConfig } from 'next'

/**
 * Next.js configuration.
 * PWA: add @serwist/next in Phase 8 after core features are done.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow Supabase Storage image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

export default nextConfig
