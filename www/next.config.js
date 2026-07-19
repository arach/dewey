const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname, '..'),
  serverExternalPackages: ['shiki'],
  async redirects() {
    return [
      { source: '/templates/topnav', destination: '/templates/centered', permanent: false },
      { source: '/templates/splitpane', destination: '/templates', permanent: false },
    ]
  },
}

module.exports = nextConfig
