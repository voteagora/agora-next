import { Page, BrowserContext, expect } from "@playwright/test";
import { FawkesClient, createFawkesClient } from "./fawkesClient";

type FawkesClientType = ReturnType<typeof createFawkesClient>;

async function waitForSessionProposal(
  client: FawkesClientType,
  maxAttempts = 20,
  intervalMs = 500
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await client.getStatus();
    const hasPending = (
      status.pendingRequests as Array<[string, unknown]>
    ).some(([key]) => key === "session_proposal");
    if (hasPending) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for Fawkes session proposal");
}

export async function setupFawkes(
  page: Page,
  context: BrowserContext,
  options?: { address?: string; mnemonic?: string },
  client: FawkesClientType = FawkesClient
) {
  // 1. Initialize headless wallet (using default single-wallet seed from ENV or FawkesClient default, or impersonated address)
  await client.createWallet(options);

  // 2. Navigate to an initial route to trigger WalletConnect (Delegates is usually a safe default)
  await page.goto("/delegates");
  await page.waitForLoadState("domcontentloaded");

  // Suppress popups
  await page.evaluate(() => {
    sessionStorage.setItem("agora-delegation-dialog-shown", "true");
  });
  await page.reload();

  // 3. Open WalletConnect modal
  const connectButton = page.getByTestId("connect-wallet-button").first();
  await expect(connectButton).toBeVisible();
  await connectButton.click();

  await page.waitForTimeout(2000);
  const otherWallets = page.getByText("Other Wallets", { exact: false });
  if (await otherWallets.isVisible()) {
    await otherWallets.click();
  }

  // 4. Extract WC URI
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const copyLinkButton = page.getByText("Copy to Clipboard");
  await expect(copyLinkButton).toBeVisible();
  await copyLinkButton.click();

  await page.waitForTimeout(500);

  const wcUri = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });

  expect(wcUri).toContain("wc:");

  // 5. Connect Fawkes and approve session
  await client.connect(wcUri);
  await waitForSessionProposal(client);

  await client.approveSession();

  // 6. Verify successful connection
  const profileDropdown = page.getByTestId("profile-dropdown-button");
  await expect(profileDropdown).toBeVisible({ timeout: 15000 });
}
