import { defineConfig, devices } from "@playwright/test";

/**
 * Multi-tenant live test strategy
 * ─────────────────────────────────
 * There is one Playwright *project* per tenant that has live proposal tests.
 * Each project sets `baseURL` to the tenant's production URL so that
 * `page.goto('/proposals/...')` resolves correctly without requiring a local
 * dev server.
 *
 * Adding a new tenant:
 *  1. Add a project entry below with the right `baseURL`.
 *  2. Create a matching spec file: tests/tenants/<tenant>-live.spec.ts
 *
 * Running specific tenants:
 *   npx playwright test --project=optimism-live
 *   npx playwright test --project=ens-live
 *   npx playwright test --project=cyber-live
 *   npx playwright test --project=scroll-live
 *
 * Running all live tests:
 *   npx playwright test --grep-invert '' --project=optimism-live --project=ens-live --project=cyber-live --project=scroll-live
 *   # or simply:
 *   npm run test:e2e:live
 */

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  expect: {
    timeout: 30000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    // ── Mocked / local dev server projects ─────────────────────────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Ignore both the old flat live specs and the new per-tenant live specs
      testIgnore: [/.*-live\.spec\.ts/, /tests\/tenants\/.*/],
    },

    // ── Live API projects (hit production directly, no local server needed) ─

    /**
     * Optimism — vote.optimism.io
     * Proposal types covered: standard-TH, approval-TH, optimistic-TH,
     *   optimistic-CH, standard-JH, approval-JH, optimistic-JH
     */
    {
      name: "optimism-live",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://vote.optimism.io",
      },
      testMatch: /tests\/tenants\/optimism-live\.spec\.ts/,
    },

    /**
     * ENS DAO — agora.ensdao.org
     * Proposal types covered: standard (OZ-gov), snapshot copeland,
     *   snapshot ranked-choice
     */
    {
      name: "ens-live",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://agora.ensdao.org",
      },
      testMatch: /tests\/tenants\/ens-live\.spec\.ts/,
    },

    /**
     * Cyber — gov.cyber.co
     * Proposal types covered: standard (AG 1/1.1)
     */
    {
      name: "cyber-live",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://gov.cyber.co",
      },
      testMatch: /tests\/tenants\/cyber-live\.spec\.ts/,
    },

    /**
     * Scroll — gov.scroll.io
     * Proposal types covered: approval (AG 1/1.1)
     */
    {
      name: "scroll-live",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://gov.scroll.io",
      },
      testMatch: /tests\/tenants\/scroll-live\.spec\.ts/,
    },
  ],
  webServer: {
    command:
      "UPSTASH_REDIS_REST_URL=http://127.0.0.1:3000/api/mock-daonode/upstash UPSTASH_REDIS_REST_TOKEN=dummy DAONODE_URL_TEMPLATE=http://127.0.0.1:3000/api/mock-daonode/ PORT=3000 npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
