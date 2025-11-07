/** @type {import('next').NextConfig} */
const fs = require("fs");
const path = require("path");

class CopyJsdomStylesheetPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("CopyJsdomStylesheetPlugin", () => {
      let jsdomBase;
      let isoBase;
      try {
        jsdomBase = path.dirname(
          require.resolve("jsdom/package.json", { paths: [__dirname] })
        );
      } catch (error) {
        console.warn(
          "[CopyJsdomStylesheetPlugin] Unable to resolve root jsdom package:",
          error
        );
      }

      try {
        isoBase = path.dirname(
          require.resolve("isomorphic-dompurify", { paths: [__dirname] })
        );
      } catch (error) {
        console.warn(
          "[CopyJsdomStylesheetPlugin] Unable to resolve isomorphic-dompurify package:",
          error
        );
      }

      const candidateSources = [
        jsdomBase
          ? path.join(jsdomBase, "lib/jsdom/browser/default-stylesheet.css")
          : null,
        isoBase
          ? path.join(
              isoBase,
              "node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css"
            )
          : null,
      ].filter(Boolean);

      const source = candidateSources.find((candidate) =>
        fs.existsSync(candidate)
      );

      if (!source) {
        console.warn(
          `[CopyJsdomStylesheetPlugin] jsdom default stylesheet not found. Checked: ${candidateSources.join(", ")}`
        );
        return;
      }

      const targetDir = path.join(compiler.outputPath, "app/browser");
      const target = path.join(targetDir, "default-stylesheet.css");

      fs.mkdirSync(targetDir, { recursive: true });
      fs.copyFileSync(source, target);
      console.log(
        `[CopyJsdomStylesheetPlugin] Copied default stylesheet to ${target}`
      );
    });
  }
}

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

    if (isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new CopyJsdomStylesheetPlugin());
    }
    return config;
  },
  experimental: {
    instrumentationHook: true,
    // Necessary to prevent github.com/open-telemetry/opentelemetry-js/issues/4297
    serverComponentsExternalPackages: ["@opentelemetry/sdk-node"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
    outputFileTracingIncludes: {
      "/": ["./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css"],
      "/delegates": [
        "./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
      ],
      "/delegates/[addressOrENSName]": [
        "./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
      ],
      "/proposals": [
        "./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
      ],
      "/proposals/[proposal_id]": [
        "./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
      ],
      "/forums/[topic_id]/[[...slug]]": [
        "./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
      ],
      "/forums": [
        "./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
      ],
      "/info": [
        "./node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
      ],
    },
  },
  output: "standalone", // Optional, good for Docker
};

module.exports = nextConfig;
