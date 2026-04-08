import { test, expect } from "@playwright/test";
import { FawkesClient } from "./utils/fawkesClient";

test.describe("Fawkes Wallet Headless Connection", () => {
  const IMPERSONATE_ADDRESS = "0x4033Bd6759cAD2E1691F6E18E1D8c1B15e3beC69";

  test("should seamlessly connect via WalletConnect to RainbowKit", async ({
    page,
    context,
  }) => {
    // 1. Initialize headless wallet
    await FawkesClient.createWallet();

    // 2. Navigate to delegates page
    await page.goto("/delegates");
    await page.waitForLoadState("domcontentloaded");

    // Suppress encouragement dialog
    await page.evaluate(() => {
      sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });
    await page.reload();

    // 3. Open WalletConnect modal
    const connectButton = page.getByTestId("connect-wallet-button").first();
    await expect(connectButton).toBeVisible();
    await connectButton.click();

    await page.waitForTimeout(2000);
    // In ConnectKit, WalletConnect is usually accessed via "Other Wallets"
    const otherWallets = page.getByText("Other Wallets", { exact: false });
    if (await otherWallets.isVisible()) {
      await otherWallets.click();
    }

    // 4. Extract WC URI from clipboard
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // In ConnectKit, the button says "Copy to Clipboard" (or similar icon)
    const copyLinkButton = page.getByText("Copy to Clipboard");
    await expect(copyLinkButton).toBeVisible();
    await copyLinkButton.click();

    // ConnectKit sets copied state
    await page.waitForTimeout(500);

    const wcUri = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    expect(wcUri).toContain("wc:");

    // 5. Connect Fawkes and approve session
    await FawkesClient.connect(wcUri);
    await page.waitForTimeout(1500);

    await FawkesClient.approveSession();

    // 6. Verify successful connection by waiting for the profile dropdown button
    const profileDropdown = page.getByTestId("profile-dropdown-button");
    await expect(profileDropdown).toBeVisible({ timeout: 15000 });
  });
});
