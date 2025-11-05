/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn4.iconfinder.com",
      },
      {
        protocol: "https",
        hostname: "cdn3.iconfinder.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "content.optimism.io",
      },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    // Fix for isomorphic-dompurify/jsdom issue
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }
    
    // Suppress MetaMask SDK warnings about React Native dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
    ];
    
    return config;
  },
  // Necessary to prevent github.com/open-telemetry/opentelemetry-js/issues/4297
  // and to fix isomorphic-dompurify/jsdom issues
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "isomorphic-dompurify",
    "jsdom",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  output: "standalone", // Optional, good for Docker
};

module.exports = nextConfig;
