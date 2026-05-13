import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

if (
  !process.env.WALLET_CONNECT_PROJECT_ID &&
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
) {
  process.env.WALLET_CONNECT_PROJECT_ID =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
}

if (!process.env.JSON_RPC_URL && process.env.NEXT_PUBLIC_ALCHEMY_ID) {
  process.env.JSON_RPC_URL = `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
}

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  expect: {
    timeout: 30000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: process.env.URL_A && process.env.URL_B ? "off" : "on-first-retry",
    video: process.env.URL_A && process.env.URL_B ? "off" : "on",
    screenshot: process.env.URL_A && process.env.URL_B ? "off" : "on",
  },
  preserveOutput: process.env.URL_A && process.env.URL_B ? "never" : "always",
  reporter: process.env.URL_A && process.env.URL_B ? "list" : "html",
  outputDir:
    process.env.URL_A && process.env.URL_B
      ? "/tmp/playwright-ab-discard"
      : "test-results",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer:
    process.env.URL_A && process.env.URL_B
      ? undefined
      : [
          {
            // ARCHIVE_GCS_BUCKET_OVERRIDE redirects GCS fetches to the local
            // mock server started by globalSetup (tests/global-setup.ts).
            command:
              "ARCHIVE_GCS_BUCKET_OVERRIDE=http://localhost:9191 PORT=3000 npm run dev",
            url: "http://127.0.0.1:3000",
            reuseExistingServer: true,
            timeout: 120 * 1000,
          },
          {
            command: "node node_modules/fawkes-wallet/src/server.js",
            url: "http://127.0.0.1:4000/wallet/status",
            reuseExistingServer: true,
            timeout: 120 * 1000,
            stdout: "pipe",
            stderr: "pipe",
          },
        ],
});
