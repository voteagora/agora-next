import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import { setupFawkes } from "./utils/fawkes-setup";

test.describe
  .serial("Proposal Creation Automation (Uniswap + Fawkes + Anvil)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });
  });

  test("PROPOSAL-001: Automate creating a Uniswap proposal using Fawkes", async ({
    page,
    context,
  }) => {
    const { FawkesClient } = await import("./utils/fawkesClient");

    // Setup Fawkes Wallet (will intercept WalletConnect requests)
    // We impersonate a known Uniswap whale (e.g. a16z) to pass the proposal threshold
    const WHALE_ADDRESS = "0x2b591e99af9bd2ad008d0e17fc3be708e9ccab0f";
    await setupFawkes(page, context, { address: WHALE_ADDRESS });

    // Navigate to the proposal creation page
    await page.goto("/proposals/create-proposal");
    await page.waitForLoadState("domcontentloaded");

    // Fill in basic proposal details
    await page.locator('input[name="title"]').fill("Automated Test Proposal via Fawkes");
    await page
      .locator('textarea[name="proposalDescription"]')
      .fill(
        "This is an automated E2E proposal created via GitHub Actions and Anvil."
      );

    // Fill in transaction details (Transfer 0 tokens to a dummy address)
    // The "Transfer from the treasury" button adds a transaction block
    const addTransferBtn = page.getByRole("button", {
      name: /Transfer from the treasury/i,
    });
    if (await addTransferBtn.isVisible()) {
      await addTransferBtn.click();

      // Fill out the TransferTransactionForm fields
      await page
        .locator('input[name="transactions.0.recipient"]')
        .fill("0x1a9c8182c09f50c8318d769245bea52c32be35bc");
      await page.locator('input[name="transactions.0.amount"]').fill("0");

      // Target the specific transaction description input
      await page
        .locator('input[name="transactions.0.description"]')
        .fill("Automated Transfer");
    }


    // Submit the proposal on-chain
    const submitBtn = page
      .getByRole("button", { name: /Submit on-chain|Create proposal/i })
      .first();
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
    await submitBtn.click();



    // Intercept and confirm the WalletConnect/Fawkes transaction prompt
    await page.waitForTimeout(2000);
    await FawkesClient.confirmTransaction().catch(() => {});

    // Verify success toast or redirect
    await expect(
      page
        .locator('text="Proposal created"')
        .or(page.locator('text="Transaction created"'))
    ).toBeVisible({ timeout: 30000 });
  });
});
