/**
 * Playwright config for on-chain Uniswap E2E tests.
 *
 * What it spins up:
 *  - Anvil:  mainnet fork on port 8546 (chain-id 1)
 *  - App:    Next.js dev server on port 3001 with NEXT_PUBLIC_AGORA_ENV=prod
 *            so it targets mainnet contract addresses and uses the Anvil RPC
 *  - Fawkes: headless wallet on port 4001, also pointed at Anvil
 *
 * Run with:
 *   npx playwright test --config playwright.onchain.config.ts
 */

import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID ?? "";
const MAINNET_RPC = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`;
const ANVIL_PORT = 8546;
const ANVIL_URL = `http://127.0.0.1:${ANVIL_PORT}`;
const APP_PORT = 3001;
const FAWKES_ONCHAIN_PORT = 4001;
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export default defineConfig({
  testDir: "./tests/web3",
  testMatch: "**/onchain-uniswap.spec.ts",
  timeout: 300_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "html",
  outputDir: "test-results-onchain",
  use: {
    baseURL: `http://127.0.0.1:${APP_PORT}`,
    trace: "on",
    video: "on",
    screenshot: "on",
  },
  projects: [
    {
      name: "chromium-onchain",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      // Anvil fork of Ethereum mainnet
      command: [
        "anvil",
        `--fork-url ${MAINNET_RPC}`,
        `--port ${ANVIL_PORT}`,
        "--chain-id 1",
        "--block-time 1",
        "--accounts 10",
        "--balance 10000",
      ].join(" "),
      url: `${ANVIL_URL}`,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      // Next.js app using mainnet contracts + Anvil as its RPC
      command: [
        `NEXT_PUBLIC_AGORA_ENV=prod`,
        `JSON_RPC_URL=${ANVIL_URL}`,
        `PORT=${APP_PORT}`,
        "npm run dev",
      ].join(" "),
      url: `http://127.0.0.1:${APP_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      stderr: "pipe",
    },
    {
      // Fawkes on a dedicated port so it doesn't conflict with the standard suite
      command: "node node_modules/fawkes-wallet/src/server.js",
      url: `http://127.0.0.1:${FAWKES_ONCHAIN_PORT}/wallet/status`,
      reuseExistingServer: true,
      timeout: 30_000,
      env: {
        ...process.env,
        PORT: String(FAWKES_ONCHAIN_PORT),
        WALLET_CONNECT_PROJECT_ID: WC_PROJECT_ID,
        JSON_RPC_URL: ANVIL_URL,
      },
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
