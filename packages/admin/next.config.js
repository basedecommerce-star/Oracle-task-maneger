/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/admin',
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
