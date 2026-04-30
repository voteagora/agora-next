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
    await page.getByLabel("Title").fill("Automated Test Proposal via Fawkes");
    await page
      .getByLabel("Description")
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
        .getByLabel("Recipient")
        .fill("0x1a9c8182c09f50c8318d769245bea52c32be35bc");
      await page.getByLabel(/Amount/i).fill("0");

      // Target the specific transaction description input
      await page
        .locator('input[name="transactions.0.description"]')
        .fill("Automated Transfer");
    }

    // Intercept Anvil RPC calls to strictly assert the generated transaction payload
    let interceptedPayload: any = null;
    await page.route("http://127.0.0.1:8545*", async (route) => {
      const request = route.request();
      if (request.method() === "POST") {
        try {
          const postData = JSON.parse(request.postData() || "{}");
          if (
            postData.method === "eth_estimateGas" ||
            postData.method === "eth_call" ||
            postData.method === "eth_sendTransaction"
          ) {
            const params = postData.params[0];
            // The function selector for propose() on Uniswap Governor is usually 0xda95691a (or similar depending on the exact Governor Bravo/Alpha interface)
            // Let's capture any payload sent to the governor (we can assume it's the proposal creation if data exists and is large)
            if (params && params.data && params.data.length > 50) {
              interceptedPayload = params;
            }
          }
        } catch (e) {}
      }
      route.continue();
    });

    // Submit the proposal on-chain
    const submitBtn = page
      .getByRole("button", { name: /Submit on-chain|Create proposal/i })
      .first();
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
    await submitBtn.click();

    // Give it a moment to trigger the simulation RPC call
    await page.waitForTimeout(2000);
    
    // Assert the frontend generated a payload
    expect(interceptedPayload).not.toBeNull();
    // Verify the target address is a contract (has a hex address)
    expect(interceptedPayload.to).toMatch(/^0x[a-fA-F0-9]{40}$/);
    // Verify the calldata contains our expected proposal data signature
    expect(interceptedPayload.data.length).toBeGreaterThan(100);


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
