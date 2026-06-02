/** @type {import('next').NextConfig} */
const path = require("path");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = withBundleAnalyzer({
  // Use a separate build cache when running the E2E test server (PORT=3001)
  // so it doesn't conflict with the developer's port-3000 dev server.
  ...(process.env.PORT === "3001" ? { distDir: ".next-test" } : {}),
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
    // Point the shim at the real package's resolved entry so its internal
    // require() does not match the exact-match alias above and recurse into
    // the shim itself (which would yield an incomplete module object).
    config.resolve.alias["swagger-ui-react-impl$"] =
      require.resolve("swagger-ui-react");
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
});

module.exports = nextConfig;
