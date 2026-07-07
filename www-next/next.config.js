const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname, '..'),
  serverExternalPackages: ['shiki'],
}

module.exports = nextConfig
