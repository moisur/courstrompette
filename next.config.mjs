/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    return [
      {
        source: '/courstrompetteparis',
        destination: 'https://courstrompette.vercel.app',
      },
      {
        source: '/courstrompetteparis/:path*',
        destination: 'https://courstrompette.vercel.app/:path*',
      },
    ];
  },

  images: {
    // Limiter les tailles d'images générables pour éviter le DoS (Image Optimization DoS)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
          {
            key: 'Content-Security-Policy',
            // Basic CSP to prevent basic XSS while allowing specific resources
            // Note: Needs to be tuned if external scripts are blocked
            value: "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self' https://www.youtube.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
