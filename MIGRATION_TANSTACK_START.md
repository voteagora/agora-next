# Migration: Next.js 14 → TanStack Start

Living document tracking the migration of `agora-next` from Next.js 14 (App Router) to TanStack Start. Plan lives at the top; **Decision log** and **Changelog** at the bottom are updated as work lands.

- **Started:** 2026-05-15
- **Owner:** Sudheer (sudheer@voteagora.com)
- **Status:** Planning

---

## 1. Baseline snapshot (2026-05-15)

Captured from the current `main` so we can measure scope and progress.

| Surface                                                            | Count | Source                             |
| ------------------------------------------------------------------ | ----: | ---------------------------------- |
| App Router pages (`page.tsx`)                                      |    39 | `find src/app -name page.tsx`      |
| API routes (`route.ts`)                                            |    90 | `find src/app/api -name route.ts`  |
| Files with `"use server"`                                          |    56 | `grep -rln "use server" src/`      |
| Files with `"use client"`                                          |   283 | `grep -rln "use client" src/`      |
| Dynamic route segments (`[…]`)                                     |    46 | `find src/app -type d -name '[*]'` |
| Layout files                                                       |     5 | `find src/app -name layout.tsx`    |
| `generateMetadata` / `metadata` / `dynamic` / `revalidate` exports |    68 | `grep -rln …`                      |
| `next/image` imports                                               |    59 | grep                               |
| `next/link` imports                                                |    62 | grep                               |
| `next/navigation` imports                                          |    59 | grep                               |
| `next/headers` imports                                             |     5 | grep                               |
| `next/server` imports                                              |   102 | grep                               |

Other notable surface area:

- **Middleware:** `src/middleware.ts` — bearer-token auth for `/api/v1/**` + CORS preflight handling.
- **Instrumentation:** `src/instrumentation.ts` + `src/instrumentation.node.ts` (`@vercel/otel`, branches on `NEXT_RUNTIME`).
- **Pages Router leftovers:** `src/pages/_error.jsx`, `src/pages/api_v1/index.tsx`.
- **Webpack aliases** in `next.config.js` lines 68–82: `react-infinite-scroller`, `swagger-ui-react`, `@react-native-async-storage/async-storage` — all shimmed under `src/lib/shims/`.
- **Build target:** Vercel, `output: 'standalone'`.
- **Notable Next-coupled deps:** `next`, `@next/third-parties`, `@next/bundle-analyzer`, `eslint-config-next`, `nuqs/adapters/next/app`, `next/font` (`src/styles/fonts.ts`).

---

## 2. What we're trading

| Concern    | Next.js (today)                        | TanStack Start                                                       |
| ---------- | -------------------------------------- | -------------------------------------------------------------------- |
| Router     | File-based App Router                  | File-based TanStack Router (Vite plugin) with code-driven route tree |
| Server fns | `"use server"` + Server Components     | `createServerFn()` (RPC-style) + `createIsomorphicFn()`              |
| API routes | `app/api/**/route.ts`                  | `createServerFileRoute()` (`routes/api/*.ts`)                        |
| SSR        | RSC + streaming                        | Full-document SSR (no RSC); server work behind `createServerFn`      |
| Middleware | `middleware.ts` (edge)                 | `createMiddleware()` chained on server fns / file routes             |
| Metadata   | `generateMetadata` / `metadata` export | `head` field on each route                                           |
| Build      | Next + webpack                         | Vite + Nitro (via Vinxi)                                             |
| Deploy     | Vercel `standalone`                    | Nitro preset (Vercel / Node / Bun / Cloudflare / Netlify)            |
| Image      | `next/image`                           | No drop-in; `@unpic/react` or roll-your-own                          |

**The biggest semantic shift:** TanStack Start has **no React Server Components**. Every component is a client component, and "server-only" logic must live inside `createServerFn` (or file routes / middleware / `createIsomorphicFn`). This is what makes the 39 pages non-trivial — many fetch data inline as Server Components today.

---

## 3. Phased plan

Each phase is one or more PRs. The app must build and ship at the end of every phase.

### Phase A — Scaffolding (1–2 days)

Stand up TanStack Start alongside the existing app; prove a hello-world route ships to Vercel. Do **not** touch `src/app` yet.

1. Install `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/router-plugin`, `vite`, `vinxi`.
2. Create `app.config.ts` with the Vinxi config, Vite plugin, Nitro preset `vercel`.
3. Migrate `tsconfig.json`: drop `next-env.d.ts`, set `"moduleResolution": "Bundler"`, add the router type-augmentation reference.
4. Port webpack aliases (`next.config.js:68–82`) to Vite `resolve.alias`.
5. Tailwind/PostCSS configs keep as-is; move `sassOptions.includePaths` (`next.config.js:9`) into Vite `css.preprocessorOptions.scss`.
6. Replace `next/font` (`src/styles/fonts.ts`) with `@fontsource/*` or self-hosted `@font-face`, preserving the `fontMapper` export shape.
7. Create entry files: `src/router.tsx`, `src/client.tsx`, `src/server.tsx`, `src/routes/__root.tsx`.

### Phase B — Foundations (3–5 days)

Port framework-agnostic code so feature work is unblocked.

- `src/lib`, `src/contexts`, `src/hooks`, `src/stores`, `src/styles`, `src/server` (Prisma, env, helpers).
- Build `__root.tsx` matching `src/app/layout.tsx`: `Web3Provider`, fonts, GA, `NuqsAdapter` (swap to `nuqs/adapters/tanstack-router`), `ForumPermissionsProvider`, `DevTenantProvider`, `TenantSwitcher`, BigInt prototype patch.
- Wire OTEL via a Nitro server plugin (replaces `src/instrumentation.{ts,node.ts}`); drop the `NEXT_RUNTIME` branch.

### Phase C — API layer (1–2 weeks)

Convert all 90 `route.ts` files to `createServerFileRoute`. Re-implement middleware (bearer auth + CORS) as `createMiddleware()` chained on `/api/v1/**` file routes. `EXCLUDED_ROUTES_FROM_AUTH` becomes route-level opt-out. One PR per top-level folder under `src/app/api/`.

### Phase D — Server actions (3–5 days)

Convert all 56 `"use server"` files to `createServerFn`. Call-sites change from `await action(x)` to `await action({ data: x })`. Wrap with `useMutation` from `@tanstack/react-query` (already installed) where optimistic UX matters.

### Phase E — Routes & UI (2–3 weeks)

Convert pages bottom-up, one feature folder per PR (`delegates`, `proposals`, `staking`, `forum`, `retropgf`, `grants`, `duna`, `staking`, `info`, `badges`, `changelog`, `admin`, `debug`, `notification-preferences`, `document-archive`, `coming-soon`, `forum-article`, `forums`, `execution`, `create`, `financials`).

### Phase F — Cutover (2–3 days)

Swap `package.json` scripts; delete `next.config.js`, `src/app`, `src/pages`; update CI; point Vercel at the Nitro preset; run full Playwright suite.

---

## 4. Conversion recipes

### 4.1 Route file

| Next.js                                               | TanStack Start                                     |
| ----------------------------------------------------- | -------------------------------------------------- |
| `app/proposals/page.tsx`                              | `routes/proposals/index.tsx`                       |
| `app/delegates/[addressOrENSName]/page.tsx`           | `routes/delegates/$addressOrENSName.tsx`           |
| `app/staking/deposits/[deposit_id]/delegate/page.tsx` | `routes/staking/deposits/$deposit_id/delegate.tsx` |
| `app/forums/(group)/page.tsx`                         | `routes/forums/_group/index.tsx`                   |
| `app/layout.tsx`                                      | `routes/__root.tsx`                                |
| `app/proposals/layout.tsx`                            | `routes/proposals/route.tsx` (layout route)        |
| `loading.tsx`                                         | `pendingComponent` on the route                    |
| `not-found.tsx`                                       | `notFoundComponent` on the route / root            |
| `app/api/.../route.ts`                                | `routes/api/.../*.ts` via `createServerFileRoute`  |

### 4.2 Per-page checklist

1. Move file, rename `[param]` → `$param`.
2. Wrap default export with `createFileRoute('/path')({ component, loader, head, pendingComponent })`.
3. Move `generateMetadata` body into `head: ({ loaderData }) => ({ meta: […], links: […] })`.
4. Drop `export const dynamic / revalidate / runtime` — express caching on the server fn / loader (`staleTime`, `gcTime`).
5. If page was an RSC fetching inline: move the fetch into a `createServerFn`, call it from `loader`, read via `Route.useLoaderData()`.
6. Replace `next/navigation` (59 sites): `useRouter` → `useNavigate`, `usePathname` → `useLocation`, `useSearchParams` → `useSearch`, `redirect`/`notFound` from `@tanstack/react-router`.
7. Replace `next/link` (62 sites): `href` → `to`, typed params.
8. Replace `next/image` (59 sites): `@unpic/react` `<Image>` or a thin wrapper; recreate `images.remotePatterns` allowlist as a manual loader if needed.

### 4.3 Server action

```ts
// before — src/app/admin/actions.ts
'use server'
export async function sponsorDraft(input: Input) { … }

// after
import { createServerFn } from '@tanstack/react-start'
export const sponsorDraft = createServerFn({ method: 'POST' })
  .validator(InputSchema)
  .handler(async ({ data }) => { … })
```

Call sites: `await sponsorDraft(x)` → `await sponsorDraft({ data: x })`.

### 4.4 API route

```ts
// src/app/api/v1/delegates/route.ts → src/routes/api/v1/delegates.ts
import { createServerFileRoute } from '@tanstack/react-start/server'

export const ServerRoute = createServerFileRoute().methods({
  GET: async ({ request }) => Response.json(…),
  POST: async ({ request }) => …,
})
```

`next/server` imports (102 sites) — `NextRequest`, `NextResponse`, `headers()`, `cookies()` — become standard `Request`/`Response` and `getHeaders()`/`getCookie()` from `@tanstack/react-start/server`.

### 4.5 Middleware (`src/middleware.ts`)

TanStack Start has no global middleware.

- **CORS:** a shared `addCorsHeaders(response)` helper applied in `/api/v1/**` file routes.
- **Bearer-token auth:** `createMiddleware().server(async ({ next }) => { /* validateBearerToken */ })` chained on `/api/v1/**` server routes; `EXCLUDED_ROUTES_FROM_AUTH` becomes per-route opt-out.

---

## 5. Library-specific notes

| Library                                     | Action                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `nuqs/adapters/next/app`                    | Swap to `nuqs/adapters/tanstack-router` (used in `src/app/layout.tsx:8`).            |
| `@next/third-parties` (GoogleAnalytics)     | Replace with a `<script>` block in `__root.tsx` `head`.                              |
| `@next/bundle-analyzer`                     | Replace with `rollup-plugin-visualizer`.                                             |
| `connectkit` + `wagmi` + `Web3Provider.tsx` | No change beyond moving the provider into `__root.tsx`.                              |
| Prisma                                      | No change; ensure `prisma generate` still runs in `dev` script.                      |
| `output: 'standalone'`                      | Drop — replaced by Nitro `vercel` preset.                                            |
| `src/pages/_error.jsx`                      | Replaced by `notFoundComponent` + `errorComponent` on root.                          |
| `src/pages/api_v1/index.tsx`                | Convert to a regular route or server file route.                                     |
| ESLint                                      | Drop `eslint-config-next`; adopt `@tanstack/eslint-plugin-router` + plain TS config. |

---

## 6. Testing & CI

- **Vitest:** `vitest.config.mts` already uses Vite; should work unchanged. De-dup `@vitejs/plugin-react` once Start provides its own.
- **Playwright:** update `baseURL` and start command in `playwright.config.ts` to match the new `dev` script.
- **MSW:** unchanged.
- **Pre-commit:** keep `prettier-src`, `lint`, `typecheck`. Linter swap noted above.

---

## 7. Risk register

| Risk                                                                                 | Mitigation                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No RSC → every page ships more JS; previously server-only deps become client bundles | Audit imports in former Server Components for Node-only modules (`@prisma/client`, `pg`, server SDKs) before converting; they MUST be wrapped in `createServerFn`, never imported into a component module |
| `next/image` optimization gone                                                       | Decide image strategy in Phase A (`@unpic/react` + Vercel image endpoint vs. skip optimization)                                                                                                           |
| Streaming/Suspense semantics differ                                                  | Re-test long-running pages (`/proposals`, `/delegates`) — use `pendingMs` / `pendingMinMs`                                                                                                                |
| Edge runtime paths                                                                   | Audit for `NEXT_RUNTIME==='edge'`; if any hot paths require edge, deploy those file routes via Nitro's edge preset                                                                                        |
| Vercel build cache misses during cutover                                             | Budget for slower first deploy                                                                                                                                                                            |
| `nuqs` TanStack adapter maturity                                                     | Pin a known-good version once verified                                                                                                                                                                    |

---

## 8. Effort estimate

- **Solo full-time:** 6–9 weeks end-to-end.
- **Two devs (API + UI split):** 4–5 weeks.
- **Long tail:** testing parity for tenant-themed pages and Web3 flows, not the framework conversion itself.

---

## 9. Phase tracker

- [x] Phase A — Scaffolding
- [~] Phase B — Foundations (fonts ✓, root layout shell ✓, providers deferred)
- [~] Phase C — API layer (22 / 90 routes ported; all bearer-auth patterns + custom-auth + cron + Prisma raw all covered)
- [~] Phase D — Server actions (4 / 56 ported across `proposalTypes`, `votes`, `getTenant`; covers no-arg + zod-validator patterns)
- [~] Phase E — Routes & UI (1 / 39 pages ported; redirect pattern locked. Blocker found: porting pages that import client components from `src/app/**` pulls Node-only `src/lib/**` modules into the browser chunk — see task #13)
- [ ] Phase F — Cutover

**Patterns locked (see §4 + §9b):**

- API auth + query params: `src/routes/api/v1/delegates.ts`
- API skipAuth (public): `spec.ts`, `votable_supply.ts`, `auth/nonce.ts`, `notification-preferences.ts`
- API POST + JSON body: `auth/verify.ts`, `relay/vote.ts`, `relay/delegate.ts`
- API dynamic param (one level): `delegates.$addressOrENSName.ts`, `proposals/$proposalId.ts`
- API dynamic param (multi-segment): `delegates.$addressOrENSName.delegators.ts`, `proposals/$proposalId.votes.ts`
- API custom auth (`requireWalletJwtAuth` + permission service): `grants/applications.ts`
- API cron-secret auth: `forum/sync-views.ts`
- API with Prisma raw SQL: `grants/applications.ts`
- Server fn (no input): `src/server/admin/proposalTypes.ts`
- Server fn with `.validator()`: `src/server/proposals/votes.ts` (`fetchUserVotesForProposal`)
- Server fn for Tenant access from a loader: `src/server/tenant/getTenant.ts`
- Page (`beforeLoad` redirect, dynamic param): `src/routes/execution/tx/$txHash.index.tsx`

**Patterns still needed:**

- API multipart/form-data (file uploads under `/api/images`, etc.)
- Page that successfully renders a real client component (blocked by task #13 — must isolate Node-only deps from `src/lib`)
- Page with `loader` + `useLoaderData` for SSR data
- OTEL instrumentation under Nitro (replaces `src/instrumentation.{ts,node.ts}`)

**Routes ported (22) — all under `src/routes/api/v1/`:**

```
delegates.ts                          delegates.$addressOrENSName.ts
delegates.$addressOrENSName.votes.ts  delegates.$addressOrENSName.delegators.ts
delegates.$addressOrENSName.delegatees.ts
spec.ts                               votable_supply.ts
auth/nonce.ts                         auth/verify.ts
contracts/token.ts                    contracts/governor.ts   contracts/alligator.ts
proposals/index.ts                    proposals/$proposalId.ts
proposals/$proposalId.votes.ts
projects.ts                           notification-preferences.ts
relay/index.ts                        relay/vote.ts           relay/delegate.ts
grants/applications.ts                forum/sync-views.ts
```

**Routes not yet ported (68):** the 20+ retrofunding tree, drafts (complex auth chain), and all 35 non-v1 routes under `src/app/api/{analytics,archive,balances,common,dao,dao-node,delegations,duna,embeds,forum,grants,images,internal,offchain-proposals,paymaster,proposals,rbac,simulate,simulate-bundle,staking,votes}`.

Per-feature E checklist (one PR each):

- [ ] `delegates` · [ ] `proposals` · [ ] `staking` · [ ] `forum` · [ ] `forums` · [ ] `forum-article` · [ ] `retropgf` · [ ] `grants` · [ ] `duna` · [ ] `info` · [ ] `badges` · [ ] `changelog` · [ ] `admin` · [ ] `debug` · [ ] `notification-preferences` · [ ] `document-archive` · [ ] `coming-soon` · [ ] `execution` · [ ] `create` · [ ] `financials`

---

## 9b. Cookbook (resume from here)

Each pattern below is verified to build against `npm run build:start` in this branch.

### API route — auth-protected GET

```ts
// src/routes/api/v1/<name>.ts
import { createFileRoute } from "@tanstack/react-router";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/<name>")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const params_q = new URL(request.url).searchParams;
        // …business logic…
        return Response.json(result);
      }),
    },
  },
});
```

- `[name]` → `$name` in the file path _and_ in the route string.
- For nested dynamic params, the file path uses dot-flat or directory form — both work: `delegates.$addressOrENSName.ts` ≡ `delegates/$addressOrENSName.ts`.
- Use `withApiAuth(fn, { skipAuth: true })` for routes in `EXCLUDED_ROUTES_FROM_AUTH` (`/spec`, `/auth/nonce`, `/auth/verify`, `/votable_supply`).
- Use `withApiAuth(fn, { allowDraftShare: true })` for `drafts/*` handlers that need the `?share=…` bypass.

### Server fn (replaces `"use server"` action)

```ts
// src/server/<area>/<fnName>.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const myAction = createServerFn({ method: "POST" })
  .validator(z.object({ foo: z.string() }))
  .handler(async ({ data }) => {
    return doWork(data.foo);
  });
```

- No-input variant: drop `.validator(…)`; the call site is `await myAction()`.
- With input: call site becomes `await myAction({ data: { foo: "…" } })` (mind the wrapper).

### Page (UI route)

```tsx
// src/routes/<segment>/<name>.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/<segment>/<name>")({
  // optional metadata (replaces generateMetadata)
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ?? "…" },
      { name: "description", content: "…" },
    ],
  }),
  // optional data loader (replaces async Server Component bodies)
  loader: async ({ params }) => {
    return await someServerFn({ data: { id: params.id } });
  },
  // optional redirect — throw, don't return
  // beforeLoad: () => { throw redirect({ to: "/elsewhere" }); },
  component: PageComponent,
});

function PageComponent() {
  const data = Route.useLoaderData();
  return <div>{data.title}</div>;
}
```

### `next/*` import swaps

| Replace                                                                     | With                                                                                                      |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `import { redirect } from "next/navigation"` (in pages)                     | `import { redirect } from "@tanstack/react-router"` + `throw redirect({ to })` from `beforeLoad`/`loader` |
| `import { useRouter, usePathname, useSearchParams } from "next/navigation"` | `useNavigate`, `useLocation`, `useSearch` from `@tanstack/react-router`                                   |
| `import Link from "next/link"`, `<Link href="…">`                           | `import { Link } from "@tanstack/react-router"`, `<Link to="…">`                                          |
| `import Image from "next/image"`                                            | `@unpic/react` `<Image>` (decision pending — call out at PR time)                                         |
| `import { headers } from "next/headers"`                                    | `import { getHeaders } from "@tanstack/react-start/server"`                                               |
| `import { NextRequest, NextResponse } from "next/server"`                   | Standard `Request` / `Response`; `Response.json(x)` instead of `NextResponse.json(x)`                     |
| `request.nextUrl.searchParams`                                              | `new URL(request.url).searchParams`                                                                       |
| `request.nextUrl.pathname`                                                  | `new URL(request.url).pathname`                                                                           |

### Route-segment config that has no equivalent — drop

- `export const dynamic = "force-dynamic"` → cache at loader level (`staleTime: 0`)
- `export const revalidate = 60` → loader `staleTime: 60_000` and/or `gcTime`
- `export const runtime = "edge"` → choose Nitro preset; per-route runtime isn't a thing in Start today

---

## 10. Decision log

Append-only. Each entry: date, decision, rationale.

| Date       | Decision                                                                                                        | Rationale                                                                                                                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-15 | In-place rewrite rather than parallel app                                                                       | Surface area (39 pages, 90 API routes, 283 `"use client"` files) makes strangler-fig more painful than the rewrite itself                                                                                                                                                                                       |
| 2026-05-15 | Vercel remains the deploy target via Nitro `vercel` preset                                                      | Keep existing infra, env, and preview URLs; no infra migration on top of framework migration                                                                                                                                                                                                                    |
| 2026-05-15 | TanStack Start v1.x uses pure Vite plugin (no Vinxi, no `app.config.ts`)                                        | v1.167.65 dropped Vinxi; config now lives in `vite.config.mts` via `@tanstack/react-start/plugin/vite`. Updated plan §3/§4 accordingly                                                                                                                                                                          |
| 2026-05-15 | Vite config is `.mts` not `.ts`                                                                                 | Project root is CJS (Next's `next.config.js` uses `module.exports`); `@tanstack/react-start/plugin/vite` is ESM-only. `.mts` forces ESM loading for just this one file without flipping the whole package to `"type":"module"` and breaking Next                                                                |
| 2026-05-15 | Both frameworks coexist during the migration                                                                    | Next on `:3000`, TanStack Start on `:3001`. `dev`/`build`/`start` keep Next; `dev:start`/`build:start`/`start:start` run the new stack. Lets us ship feature-by-feature without a flag day                                                                                                                      |
| 2026-05-15 | Server routes use `createFileRoute(...)({ server: { handlers: { GET, POST } } })` not `createServerFileRoute()` | Older docs referenced `createServerFileRoute` (no longer exported). The current API reuses `createFileRoute` from `@tanstack/react-router` and tells server-vs-UI apart by whether you provide `server.handlers` or `component`                                                                                 |
| 2026-05-15 | Parallel `fonts-tanstack.ts` rather than swap-in-place                                                          | Keeping `src/styles/fonts.ts` (next/font) intact protects the Next build. Consumers switch import path at Phase F (one-line change per file). Both modules expose the same shape                                                                                                                                |
| 2026-05-15 | `edgeAuth.ts` made isomorphic (`NextRequest` → `Request`)                                                       | Used `new URL(request.url).pathname` in place of `request.nextUrl.pathname`. `NextRequest extends Request`, so all existing Next callers keep working — type was widened, not narrowed                                                                                                                          |
| 2026-05-15 | `server-only` aliased to an empty shim in `vite.config.mts`                                                     | Next handles `import "server-only"` natively; Vite/Rollup can't resolve it. Reuses `src/__mocks__/server-only.ts` (already used by vitest)                                                                                                                                                                      |
| 2026-05-15 | Sass `@/styles/...` imports resolved via a custom Sass importer                                                 | Vite doesn't honor JS path aliases inside SCSS @import. Custom `findFileUrl` in `vite.config.mts` maps `@/` → `src/`. Keeps existing .scss files unchanged                                                                                                                                                      |
| 2026-05-15 | Root layout (`__root.tsx`) ported in two layers; Layer 1 only                                                   | Layer 1 = global CSS / fonts / theme vars / BigInt patch. Layer 2 (Web3Provider, NuqsAdapter, DevTenantProvider, ForumPermissionsProvider, Header, GoogleAnalytics) is deferred until the first consuming page is ported in Phase E — each provider needs validation outside RSC and would block scaffolding    |
| 2026-05-15 | Stub server-only modules in client bundles via Vite plugin                                                      | Without RSC there's no automatic strip of server code from the client graph. The plugin matches `*.server.ts(x)`, `src/app/api/**`, and `src/instrumentation*.ts` and emits a stub with named exports set to `undefined`. SSR keeps the originals. Future server-only modules just need the `.server.ts` suffix |
| 2026-05-15 | Vite extension order: `.tsx` before `.jsx`                                                                      | Two `Button` files exist (`Button.jsx` legacy, `Button.tsx` current). Next resolved `.tsx` first via TS-first lookup; Vite's default order puts `.jsx` first, picking the wrong file. Explicit `resolve.extensions` fixes it                                                                                    |
| 2026-05-15 | Phase D walks client-imported actions BEFORE Phase E pages that depend on them                                  | TanStack's import-protection (correctly) refuses client components that pull `"use server"` implementations into the client bundle. Phase D conversion to `createServerFn` is now ordered before the corresponding Phase E pages — see task #14                                                                 |

---

## 11. Changelog

Append-only. One entry per landed PR / meaningful change. Format: `YYYY-MM-DD — <phase> — <summary> (<PR # or commit>)`.

- 2026-05-15 — Phase A — Branched `migration/tanstack-start` off `main` (clean working tree)
- 2026-05-15 — Phase A — Installed `@tanstack/react-start@1.167.65`, `@tanstack/react-router@1.169.2`, promoted `vite@^7` to explicit devDep (already at 7.2.2 via vitest)
- 2026-05-15 — Phase A — Added `vite.config.mts` with `tanstackStart()`, `viteReact()`, `vite-tsconfig-paths`. Ports `sassOptions.includePaths` from `next.config.js:9`. Path aliases (incl. shims) flow through tsconfig.json
- 2026-05-15 — Phase A — Added `src/router.tsx` (`getRouter()` factory), `src/routes/__root.tsx` (minimal root with `HeadContent` + `Scripts`), `src/routes/index.tsx` (hello-world)
- 2026-05-15 — Phase A — Added scripts `dev:start` (port 3001), `build:start`, `start:start` to `package.json`; left Next scripts untouched
- 2026-05-15 — Phase A — Updated `.gitignore` for `.output/`, `.nitro/`, `src/routeTree.gen.ts`
- 2026-05-15 — Phase A — Verified: `npm run build:start` produces `dist/client` + `dist/server`; `npm run build` (Next) still passes all routes. Both stacks coexist
- 2026-05-15 — Phase B — Added `src/styles/fonts.css` with `@font-face` rules for Inter / Rajdhani / Chivo Mono / Instrument Serif / Regola; matching `.font-*-var` utility classes set the `--font-*` CSS variables Tailwind reads
- 2026-05-15 — Phase B — Added `src/styles/fonts-tanstack.ts`, shape-compatible parallel of `src/styles/fonts.ts`. Phase F will swap consumer imports
- 2026-05-15 — Phase B — Layer 1 of `src/routes/__root.tsx` complete: globals.scss, fonts.css, BigInt patch, default theme variables (RGB triplets + dark-mode fallbacks), favicon links, viewport meta. Providers (Web3, Nuqs, GA, DevTenant, ForumPermissions, Header, DAOMetricsHeader) deferred
- 2026-05-15 — Phase B — `vite.config.mts`: added custom Sass importer for `@/` paths and aliased `server-only` to the existing test shim
- 2026-05-15 — Phase C — Added `src/lib/start-server/cors.ts` (port of `setOptionsCorsHeaders` + `setCorsHeaders` from `src/middleware.ts`)
- 2026-05-15 — Phase C — Added `src/lib/start-server/withApiAuth.ts` — the global-middleware replacement. Generic over handler ctx so `params` flow through for dynamic-segment routes. Options: `skipAuth`, `allowDraftShare`
- 2026-05-15 — Phase C — Made `src/app/lib/auth/edgeAuth.ts` isomorphic (accepts `Request`, computes pathname via `new URL(request.url)`)
- 2026-05-15 — Phase C — Ported 3 representative routes: `delegates` (auth + query + zod + trace), `spec` (`skipAuth`), `delegates.$addressOrENSName` (dynamic param). Pattern: `createFileRoute("/api/v1/…")({ server: { handlers: { GET: withApiAuth(async ({request, params}) => …) } } })`
- 2026-05-15 — Phase D — Ported `fetchProposalTypes` to `src/server/admin/proposalTypes.ts` via `createServerFn({ method: "GET" }).handler(…)`. Pattern locked for no-arg actions
- 2026-05-15 — Phase E — Ported `src/app/execution/tx/[txHash]/page.tsx` → `src/routes/execution/tx/$txHash.index.tsx`. Demonstrates dynamic-param syntax and `redirect()` from `@tanstack/react-router` via `beforeLoad`
- 2026-05-15 — Verified: `npm run build:start` builds all ported routes/fns (291 SSR modules); `npm run build` (Next) still passes (57 static pages generated). The pre-existing `dynamic-server-usage` notices on `main` are unchanged
- 2026-05-15 — Phase C — Ported `auth/nonce` (GET, skipAuth), `auth/verify` (POST + `request.json()`, skipAuth)
- 2026-05-15 — Phase C — Ported `votable_supply` (skipAuth), `projects`, `notification-preferences` (custom auth — `requireNotificationPreferencesAuth`)
- 2026-05-15 — Phase C — Ported `contracts/{token,governor,alligator}` (3 simple auth routes)
- 2026-05-15 — Phase C — Ported `proposals/{index,$proposalId,$proposalId.votes}` (3 routes; demonstrates index + multi-segment dynamic params)
- 2026-05-15 — Phase C — Ported `delegates/{$addressOrENSName.{delegators,delegatees,votes}}` (3 more dynamic-param routes)
- 2026-05-15 — Phase C — Ported `relay/{index,vote,delegate}` (1 GET, 2 POST with body validation via inline zod schemas)
- 2026-05-15 — Phase C — Ported `grants/applications` (custom JWT auth + permission service + Prisma raw SQL — most complex pattern so far) and `forum/sync-views` (cron-secret auth)
- 2026-05-15 — Phase D — Ported `fetchProposalsCount`, `fetchUserVotesForProposal`, `fetchProposalVotes` from `src/app/proposals/actions.tsx` to `src/server/proposals/votes.ts` — demonstrates `.validator()` with zod for multi-arg call-site shape change
- 2026-05-15 — Phase D — Added `src/server/tenant/getTenant.ts` (`getTenantNotificationsContext`) — pattern for tenant access from `loader`/`beforeLoad`
- 2026-05-15 — Phase E — Attempted `notification-preferences/page.tsx` port; rolled back when build surfaced that the imported client component pulls `src/lib/metricWrapper.ts` (async_hooks) into the browser chunk. Documented as task #13; this blocks the Phase E mechanical sweep until Node-only modules in `src/lib` are isolated
- 2026-05-15 — Vite config — Added shim `src/lib/shims/next-font-local.ts` and aliased `next/font/local` → that shim, so any `src/app/**` source that still imports next/font resolves cleanly under Vite (real fonts come from `src/styles/fonts.css`)
- 2026-05-15 — Verified: 22 / 90 API routes, 4 / 56 server fns, 1 / 39 pages ported. `npm run build:start` clean at 352 SSR modules. `npm run build` (Next) still ✓
- 2026-05-15 — Phase E prereq (task #13) — Added `stubServerOnlyModulesInClient()` Vite plugin in `vite.config.mts`. Stubs three categories of files in the **client** environment only (SSR keeps them intact): (a) `*.server.ts(x)`, (b) anything under `src/app/api/**`, (c) `src/instrumentation*.ts`. Stub preserves named-export shape by regex-extracting export names from source so consumers that do `{ foo } from "…server"` still resolve (foo becomes `undefined` at the call site)
- 2026-05-15 — Phase E prereq — Set `resolve.extensions` in `vite.config.mts` to prefer `.tsx` over `.jsx` (fixes `Button.jsx` vs `Button.tsx` collision that Next resolved via TS-first lookup)
- 2026-05-15 — Phase E prereq — Renamed `src/lib/metricWrapper.ts` → `src/lib/metricWrapper.server.ts` (uses `async_hooks` / `AsyncLocalStorage`); updated all 7 importers under `src/app/api/common/`. Both `npm run build:start` and `npm run build` (Next) still pass
- 2026-05-15 — Phase E discovery — Retrying the `notification-preferences` page port after the stub plugin landed surfaced TanStack Start's own import-protection: client components transitively import `"use server"` implementations (chain: `DialogProvider → dialogs → ClearAllDraftsButton → deleteAllDraftProposals → authHelpers → siweAuth.server`). Phase E cannot scale until these actions are converted to `createServerFn` (Phase D) and client components updated to call the RPCs. Captured as task #14 — new ordering constraint: Phase D must walk client-imported actions first
