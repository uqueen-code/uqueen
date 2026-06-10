/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow images from Supabase and other sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Vercel serverless function config
  // API routes auto-deploy as serverless functions
  experimental: {
    // No experimental flags needed for basic deployment
  },

  // Output mode: 'standalone' is best for Vercel
  output: 'standalone',

  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;
