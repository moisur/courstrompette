/** @type {import('next').NextConfig} */
const nextConfig = {
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
         remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**', // Autorise tous les chemins sous m.media-amazon.com
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Autorise tous les chemins sous m.media-amazon.com
      }
    ],
  },
};

export default nextConfig;
