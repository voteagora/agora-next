import { defineConfig, devices } from "@playwright/test";

/**
 * Global Web3 E2E configuration leveraging Synpress.
 * Separated from main playwright.config.ts to avoid polluting standard UI assertions.
 */
export default defineConfig({
  testDir: "./tests/web3",
  fullyParallel: true,
  // Single worker for web3 flows due to metamask instance locking / browser state caching
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Run the Next.js production server, relying on mock-daonode proxy
    command:
      'DAONODE_URL_TEMPLATE="http://127.0.0.1:3000/api/mock-daonode/" npm run dev',
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
