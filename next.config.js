/** @type {import('next').NextConfig} */
const path = require("path");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = withBundleAnalyzer({
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  typescript: {
    // Type checking is handled and flagged by CI (GitHub Actions).
    // Skipping here to reduce Vercel build time and memory usage.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Linting is handled and flagged by CI (GitHub Actions).
    // Skipping here to reduce Vercel build time and memory usage.
    ignoreDuringBuilds: true,
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
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["react-infinite-scroller$"] = path.resolve(
      __dirname,
      "src/lib/shims/InfiniteScroll.tsx"
    );
    config.resolve.alias["swagger-ui-react$"] = path.resolve(
      __dirname,
      "src/lib/shims/SwaggerUI.tsx"
    );
    config.resolve.alias["@react-native-async-storage/async-storage$"] =
      path.resolve(__dirname, "src/lib/shims/asyncStorage.ts");
    return config;
  },
  experimental: {
    instrumentationHook: true,
    // Necessary to prevent github.com/open-telemetry/opentelemetry-js/issues/4297
    serverComponentsExternalPackages: ["@opentelemetry/sdk-node"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  output: "standalone", // Optional, good for Docker
  productionBrowserSourceMaps: false,
});

module.exports = nextConfig;
