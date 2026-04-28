import { test, expect } from "@playwright/test";
import { FawkesClient } from "./utils/fawkesClient";

test.describe("Fawkes Wallet Headless Connection", () => {
  test("should seamlessly connect via WalletConnect to RainbowKit", async ({
    page,
    context,
  }) => {
    // 1. Initialize headless wallet
    // To initialize with a specific seed phrase, provide a mnemonic:
    // await FawkesClient.createWallet({ mnemonic: "word1 word2..." });
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

    // 7. Pause the execution here so you can record your video or inspect the DOM
    await page.pause();
  });
});
