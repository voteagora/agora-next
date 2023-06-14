import withMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**"
      },
      {
        protocol: "http",
        hostname: "**",
        port: "",
        pathname: "**"
      }
    ]
  },
  reactStrictMode: true,
  transpilePackages: ["ui"],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  }
}

const config = withMDX()(nextConfig)

export default config
