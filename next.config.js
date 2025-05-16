/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bunnycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '**.deno.dev',
      },
      {
        protocol: 'https',
        hostname: 'sexcityhub.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'vz-7503b6d0-a19.b-cdn.net',
      },
    ],
  },
}

module.exports = nextConfig 