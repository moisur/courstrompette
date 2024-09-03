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
  };
  
  export default nextConfig;