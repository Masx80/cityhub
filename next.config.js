/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'sexcityhub.b-cdn.net'
    ],
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
        hostname: '**.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'vz-7503b6d0-a19.b-cdn.net',
      },
    ],
  },
  poweredByHeader: false, // Remove X-Powered-By header for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 