import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

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
      testIgnore: ["**/ab-runner/**"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "ab",
      testDir: "./tests/ab-runner",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer:
    process.env.URL_A && process.env.URL_B
      ? undefined
      : {
          command: "PORT=3000 npm run dev",
          url: "http://127.0.0.1:3000",
          reuseExistingServer: true,
          timeout: 120 * 1000,
        },
});
