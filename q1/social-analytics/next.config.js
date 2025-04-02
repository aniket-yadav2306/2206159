/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.dicebear.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://20.244.56.144/evaluation-service/:path*',
      },
    ];
  },
}

module.exports = nextConfig 