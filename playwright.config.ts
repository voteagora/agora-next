import { defineConfig, devices } from "@playwright/test";

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
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    video: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command:
        "UPSTASH_REDIS_REST_URL=http://127.0.0.1:3000/api/mock-daonode/upstash UPSTASH_REDIS_REST_TOKEN=dummy DAONODE_URL_TEMPLATE=http://127.0.0.1:3000/api/mock-daonode/ PORT=3000 npm run dev",
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
