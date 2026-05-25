import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'cautious-space-telegram-pw9gvr475wrc9rg9-3000.app.github.dev',
        'localhost:3000',
        'cally.vercel.app'
      ]
    }
  }
};

export default nextConfig;