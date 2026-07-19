import type { NextConfig } from "next"

const isProductionBuild = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  ...(isProductionBuild ? { output: "export" as const } : {}),
  images: { unoptimized: true },
  transpilePackages: ["@arach/dewey"],
}

export default nextConfig
