import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { defineConfig, loadEnv, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Stubs server-only modules in the CLIENT bundle.
 *
 * Next strips server-only code via the RSC boundary; TanStack Start has no
 * such boundary, so any client module that transitively imports a server-only
 * file would pull Node-only deps (async_hooks, fs, pg, @vercel/otel, …) into
 * the browser.
 *
 * Modules treated as server-only (stubbed to empty exports in client env):
 *   1. Any file ending in `.server.ts` / `.server.tsx` (existing convention)
 *   2. Anything under `src/app/api/**` (the legacy Next API + shared data
 *      fetchers — none of this should ever run client-side; loaders /
 *      server-fns are the legitimate client entry points)
 *   3. `src/instrumentation*.ts` (OTEL setup — runs at server boot only)
 *   4. Any file under `src/app/**` (outside of api/) that has `"use server"`
 *      as its first directive — these are Next.js server actions that
 *      TanStack Start cannot execute client-side. When these pages/features
 *      are ported, the corresponding UI components will call createServerFn
 *      instead of importing the action directly.
 *
 * In the SSR / server environment we leave imports intact. In the client
 * environment we replace the module body with empty exports — anything that
 * actually runs server-side will route through a server fn or file-route
 * handler, so the client never executes these modules at runtime.
 */
function stubServerOnlyModulesInClient(): Plugin {
  const SERVER_ONLY_SUFFIX = /\.server\.(ts|tsx|js|jsx)$/;
  const apiTreePrefix = path.resolve(__dirname, "src/app/api") + path.sep;
  const prismaPath = path.resolve(__dirname, "src/app/lib/prisma.ts");
  const appSrcPrefix = path.resolve(__dirname, "src/app") + path.sep;
  const libActionsPrefix =
    path.resolve(__dirname, "src/lib/actions") + path.sep;
  const libSrcPrefix = path.resolve(__dirname, "src/lib") + path.sep;
  const instrumentationPath = path.resolve(__dirname, "src/instrumentation");
  // Directories that are legitimately isomorphic TanStack Start files.
  // These are excluded from the "use server" scan even if they somehow gained
  // that directive — they use createServerFn / createServerFileRoute which
  // the TanStack bundler handles natively without our stub.
  const tanstackServerPrefix = path.resolve(__dirname, "src/server") + path.sep;
  const tanstackRoutesPrefix = path.resolve(__dirname, "src/routes") + path.sep;
  // Matches "use server" or 'use server' at start of file content (after trim).
  const USE_SERVER_RE = /^["']use server["']/;

  function isServerOnlyByPath(cleanId: string): boolean {
    if (SERVER_ONLY_SUFFIX.test(cleanId)) return true;
    if (cleanId.startsWith(apiTreePrefix)) return true;
    if (cleanId === prismaPath) return true;
    if (cleanId.startsWith(libActionsPrefix)) return true;
    if (
      cleanId === `${instrumentationPath}.ts` ||
      cleanId === `${instrumentationPath}.node.ts`
    )
      return true;
    return false;
  }

  // Extract export names from a source file so the stub preserves named-export
  // shape. Handles the patterns this codebase actually uses:
  //   export const foo / export let foo / export var foo
  //   export function foo / export async function foo
  //   export class Foo
  //   export { a, b, c as d }
  //   export type Foo / export interface Foo  (type-only — emitted as `undefined`)
  //   export * from …                          (cannot resolve at stub time — ignored)
  function extractExportNames(src: string): {
    named: Set<string>;
    hasDefault: boolean;
  } {
    const named = new Set<string>();
    let hasDefault = false;

    if (/\bexport\s+default\b/.test(src)) hasDefault = true;

    const patterns: Array<RegExp> = [
      /\bexport\s+(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/g,
      /\bexport\s+class\s+([A-Za-z_$][\w$]*)/g,
      /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
      /\bexport\s+(?:type|interface)\s+([A-Za-z_$][\w$]*)/g,
    ];
    for (const re of patterns) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) named.add(m[1]);
    }

    // export { a, b as c }
    const braceRe = /\bexport\s*\{([^}]+)\}/g;
    let bm: RegExpExecArray | null;
    while ((bm = braceRe.exec(src)) !== null) {
      for (const entry of bm[1].split(",")) {
        const cleaned = entry
          .replace(/\btype\b/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!cleaned) continue;
        const asMatch = cleaned.match(/\s+as\s+([A-Za-z_$][\w$]*)$/);
        const local = asMatch ? asMatch[1] : cleaned.split(/\s+/)[0];
        if (local && local !== "default") named.add(local);
        if (cleaned.endsWith(" as default") || cleaned === "default")
          hasDefault = true;
      }
    }

    return { named, hasDefault };
  }

  function buildStub(src: string, comment: string): string {
    const { named, hasDefault } = extractExportNames(src);
    const lines = [`// ${comment}`];
    for (const name of named) lines.push(`export const ${name} = undefined;`);
    if (hasDefault) lines.push("export default undefined;");
    // Ensure the module is treated as ESM even if it had no parseable exports.
    if (named.size === 0 && !hasDefault) lines.push("export {};");
    return lines.join("\n") + "\n";
  }

  return {
    name: "agora:stub-server-only-in-client",
    enforce: "pre",
    applyToEnvironment(env) {
      // Vite 6+ environments API; for our setup `client` is the browser build.
      return env.name === "client";
    },
    async load(id) {
      const cleanId = id.split("?")[0];
      const fs = await import("node:fs/promises");

      // Fast path: known server-only by path/suffix conventions.
      if (isServerOnlyByPath(cleanId)) {
        let src = "";
        try {
          src = await fs.readFile(cleanId, "utf8");
        } catch {
          // Synthetic id — emit a minimal stub.
          return `export {};\nexport default {};\n`;
        }
        return buildStub(
          src,
          "stubbed server-only module in client bundle (TanStack migration)"
        );
      }

      // Slow path: detect Next.js server actions by "use server" directive.
      //
      // Scan any file under src/ EXCEPT:
      //   • src/app/api/** — already handled by the fast path above
      //   • src/server/**  — TanStack createServerFn files (isomorphic by design)
      //   • src/routes/**  — TanStack file routes  (isomorphic by design)
      //
      // The original scope was limited to src/app/ but src/lib/actions/**
      // (and other src/lib/** helpers) also carry "use server" directives that
      // must not leak into the client bundle (e.g. authHelpers.ts → siweAuth.server.ts).
      const isInAppTree = cleanId.startsWith(appSrcPrefix);
      const isInLibTree = cleanId.startsWith(libSrcPrefix);
      const isTanstackServerFile =
        cleanId.startsWith(tanstackServerPrefix) ||
        cleanId.startsWith(tanstackRoutesPrefix);

      if ((isInAppTree || isInLibTree) && !isTanstackServerFile) {
        let src = "";
        try {
          src = await fs.readFile(cleanId, "utf8");
        } catch {
          return null;
        }
        if (USE_SERVER_RE.test(src.trimStart())) {
          return buildStub(
            src,
            "stubbed Next.js server action in client bundle (TanStack migration)"
          );
        }
      }

      return null;
    },
  };
}

/**
 * Rewrites `import { cache } from 'react'` to use the local shim in SSR.
 *
 * React.cache lives behind the `react-server` module condition that Next.js
 * enables in its webpack config. Vite SSR resolves `react` via the `node`
 * condition, which doesn't include `cache`. Any src/app/ file that uses it
 * (Next.js RSC pattern for request deduplication) would crash the SSR runner.
 *
 * We keep these files unchanged for Next.js compatibility and instead rewrite
 * the import at bundle time: `{ cache } from 'react'` → our no-op shim. The
 * shim is a pass-through that just returns the function, which is correct for
 * Vite SSR where there is no React request context to memoize into.
 */
function polyfillReactCacheInSSR(): Plugin {
  const shimPath = JSON.stringify(
    path.resolve(__dirname, "src/lib/shims/react-cache.ts")
  );
  // Matches named imports from 'react' or "react" that include `cache`.
  // Groups: [1] = everything before `cache`, [2] = everything after.
  const IMPORT_RE =
    /^(import\s*\{)([^}]*)(\bcache\b)([^}]*)(\}\s*from\s*['"]react['"])/gm;

  return {
    name: "agora:react-cache-polyfill-ssr",
    enforce: "pre",
    applyToEnvironment(env) {
      // Apply in all non-client environments (SSR, server).
      return env.name !== "client";
    },
    transform(code, id) {
      const cleanId = id.split("?")[0];
      if (!/\.(ts|tsx|js|jsx|mts|mjs)$/.test(cleanId)) return null;
      if (!code.includes("cache") || !code.includes("react")) return null;

      let changed = false;
      const result = code.replace(
        IMPORT_RE,
        (_match, open, before, _cache, after, close) => {
          changed = true;
          // Other named imports (if any) stay in the original `from 'react'` import.
          const others = (before + after)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
            .join(", ");
          const reactImport = others ? `${open} ${others} ${close}` : null;
          const cacheImport = `import { cache } from ${shimPath}`;
          return [reactImport, cacheImport].filter(Boolean).join(";\n");
        }
      );

      return changed ? { code: result } : null;
    },
  };
}

function buildPublicEnvDefines(mode: string): Record<string, string> {
  const loadedEnv = loadEnv(mode, process.cwd(), "");
  const env = { ...loadedEnv, ...process.env };
  const defines: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      defines[`process.env.${key}`] = JSON.stringify(value);
    }
  }

  return defines;
}

// Sibling Vite build for the TanStack Start migration.
// Runs alongside the existing Next.js app via `npm run dev:start` / `build:start`.
// Path aliases (including the shims for react-infinite-scroller and
// @react-native-async-storage/async-storage) are picked up from tsconfig.json.
export default defineConfig(({ mode }) => ({
  define: buildPublicEnvDefines(mode),
  server: {
    port: 3000,
  },
  ssr: {
    // Packages whose ESM builds have broken imports (CSS imports, or
    // extensionless relative imports like `./foo` without `.js`) must be
    // processed by Vite's bundler rather than Node's raw ESM loader.
    noExternal: [
      /^@uiw\//, // imports .css in ESM
      "@ethereum-attestation-service/eas-sdk", // extensionless ESM imports
      /^@aa-sdk\//, // extensionless ESM imports
      /^@account-kit\//, // extensionless ESM imports
      /^@alchemy\/aa-/, // extensionless ESM imports
    ],
  },
  resolve: {
    // Prefer .ts(x) over .js(x): the codebase has both `Button.jsx` (legacy) and
    // `Button.tsx` (current) and Next picked the .tsx variant via TS-first
    // resolution. Vite's default order puts .jsx ahead — reverse it.
    extensions: [".mjs", ".js", ".mts", ".ts", ".tsx", ".jsx", ".json"],
    alias: {
      ".prisma/client/index-browser": path.resolve(
        __dirname,
        "node_modules/.prisma/client/index-browser.js"
      ),
      // Next.js handles `import "server-only"` natively; under Vite we map it
      // to an empty shim so legacy server modules still build.
      "server-only": path.resolve(__dirname, "src/__mocks__/server-only.ts"),
      // next/font/local only runs inside Next's build pipeline. Anything in
      // src/app/** that still imports it gets a Font-shaped no-op shim; the
      // real @font-face rules live in src/styles/fonts.css.
      "next/font/local": path.resolve(
        __dirname,
        "src/lib/shims/next-font-local.ts"
      ),
      // next/image requires Next.js internals and cannot run in Vite. This
      // shim renders a plain <img> element with the same public API.
      "next/image": path.resolve(__dirname, "src/lib/shims/next-image.tsx"),
      // next/navigation hooks require the Next.js App Router context and crash
      // under Vite SSR. This shim maps each hook to its TanStack Router
      // equivalent so all 59 import sites work without source changes.
      // Both bare and .js-suffixed forms are covered: @vercel/* packages import
      // "next/navigation.js" (ESM explicit extension).
      "next/navigation": path.resolve(
        __dirname,
        "src/lib/shims/next-navigation.ts"
      ),
      "next/navigation.js": path.resolve(
        __dirname,
        "src/lib/shims/next-navigation.ts"
      ),
      // next/cache (unstable_cache, revalidatePath, revalidateTag) requires
      // Next.js incremental-cache infrastructure and throws under Vite SSR.
      // This shim makes unstable_cache a no-op pass-through and silences the
      // revalidation helpers.
      "next/cache": path.resolve(__dirname, "src/lib/shims/next-cache.ts"),
      // next/link uses Next.js router internals. This shim renders a plain <a>
      // element that works for all navigation without framework coupling.
      "next/link": path.resolve(__dirname, "src/lib/shims/next-link.tsx"),
      // next/server (NextResponse, NextRequest) used in walletJwt.ts and API
      // route helpers. This shim extends the standard Response/Request classes.
      "next/server": path.resolve(__dirname, "src/lib/shims/next-server.ts"),
      // next/headers — throws at runtime; only used in dead-code paths.
      "next/headers": path.resolve(__dirname, "src/lib/shims/next-headers.ts"),
      // next/og — OG image routes not yet ported; shim satisfies TypeScript.
      "next/og": path.resolve(__dirname, "src/lib/shims/next-og.ts"),
      // next (bare) — Metadata type used in metadata.ts.
      next: path.resolve(__dirname, "src/lib/shims/next.ts"),
      // Draft proposal "use server" actions → createServerFn wrappers.
      // The stub plugin would make these undefined in the client bundle;
      // these aliases redirect to our src/server/ wrappers before stubbing runs.
      "@/app/proposals/draft/actions/deleteDraftProposal": path.resolve(
        __dirname,
        "src/server/proposals/draft/deleteDraftProposal.ts"
      ),
      "@/app/proposals/draft/actions/requestSponsorship": path.resolve(
        __dirname,
        "src/server/proposals/draft/requestSponsorship.ts"
      ),
      "@/app/proposals/draft/actions/createDraftProposal": path.resolve(
        __dirname,
        "src/server/proposals/draft/createDraftProposal.ts"
      ),
      "@/app/proposals/draft/actions/createTempCheck": path.resolve(
        __dirname,
        "src/server/proposals/draft/createTempCheck.ts"
      ),
      "@/app/proposals/draft/actions/createGithubChecklistItem": path.resolve(
        __dirname,
        "src/server/proposals/draft/createGithubChecklistItem.ts"
      ),
      "@/app/proposals/draft/actions/sponsorDraftProposal": path.resolve(
        __dirname,
        "src/server/proposals/draft/sponsorDraftProposal.ts"
      ),
      "@/app/proposals/draft/actions/revalidatePath": path.resolve(
        __dirname,
        "src/server/proposals/draft/revalidatePath.ts"
      ),
      // Forum unpublished-topic actions — "use server" + next/headers in the
      // original; redirected to a createServerFn wrapper for TanStack Start.
      "@/lib/actions/forum/unpublishedTopic": path.resolve(
        __dirname,
        "src/server/forum/unpublishedTopic.ts"
      ),
      // dao-node server-client — "use server"; imported by isomorphic
      // votingPowerUtils which runs client-side via useForumPermissions.
      "@/app/lib/dao-node/server-client": path.resolve(
        __dirname,
        "src/server/dao-node/serverClient.ts"
      ),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Next resolved `@import "@/styles/..."` via its built-in webpack alias.
        // Vite has no equivalent for Sass, so register a Sass importer that
        // rewrites `@/` to `src/`. Keeps existing .scss files unchanged.
        importers: [
          {
            findFileUrl(url: string) {
              if (url.startsWith("@/")) {
                return pathToFileURL(
                  path.resolve(__dirname, "src", url.slice(2))
                );
              }
              return null;
            },
          },
        ],
        // The codebase uses `@import` throughout; suppress the Dart Sass
        // deprecation noise until we migrate all sheets to `@use`/`@forward`.
        silenceDeprecations: ["import"],
      },
    },
  },
  plugins: [
    tsconfigPaths({
      // Limit to the root tsconfig so vitest's tsconfig is not double-loaded.
      projects: ["./tsconfig.json"],
    }),
    stubServerOnlyModulesInClient(),
    polyfillReactCacheInSSR(),
    tanstackStart({
      target: "vercel",
    }),
    viteReact(),
  ],
}));
