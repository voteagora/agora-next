/** @type {import('next').NextConfig} */

const path = require("path");
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/delegate/:addressOrENSName',
        destination: '/delegates/:addressOrENSName',
        permanent: true,
      },
      {
        source: '/api/v1/delegates/:addressOrENSName',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/api/v1/proposals/:proposalId',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/api/v1/proposals',
        destination: '/404',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source:
          "/proposals/102821998933460159156263544808281872605936639206851804749751748763651967264110",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=59, stale-while-revalidate=59",
          },
        ],
      },
      {
        source:
          "/proposals/20327152654308054166942093105443920402082671769027198649343468266910325783863",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=59, stale-while-revalidate=59",
          },
        ],
      },
      {
        source: "/delegates/0x2b888954421b424c5d3d9ce9bb67c9bd47537d12",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=59, stale-while-revalidate=59",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  experimental: {
    instrumentationHook: true,
    // Necessary to prevent github.com/open-telemetry/opentelemetry-js/issues/4297
    serverComponentsExternalPackages:["@opentelemetry/sdk-node"]
  },
};

module.exports = nextConfig;

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "agora-ph",
    project: "agora-next",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
