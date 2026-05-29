/**
 * On-chain Uniswap E2E tests — require the onchain playwright config.
 *
 * Run with:
 *   npx playwright test --config playwright.onchain.config.ts
 *
 * These tests:
 *  1. Impersonate a UNI whale via Fawkes (anvil_impersonateAccount under the hood)
 *  2. Drive the real UI (form fill, clicks)
 *  3. Submit transactions to a local Anvil fork of Ethereum mainnet
 *  4. Assert on-chain state changed using ethers.js against the fork's RPC
 */

import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import { ethers } from "ethers";
import { setupFawkes } from "./utils/fawkes-setup";
import { createFawkesClient } from "./utils/fawkesClient";
import {
  WHALE_ADDRESS,
  UNI_GOVERNOR_ADDRESS,
  getAnvilProvider,
  getDelegate,
  getProposalCount,
  getLatestProposalId,
  getProposalState,
  hasVoted,
  mineBlocks,
  setEthBalance,
  getVotingDelay,
  fundWhaleWithUni,
  waitAndApproveRequest,
  resetFork,
  getCurrentVotes,
  getUniBalance,
  getProposalThreshold,
  ProposalState,
} from "./utils/anvilClient";
import { redirectRpcToAnvil, mockVotableSupply } from "./utils/apiMocks";

// Fawkes instance running on port 4001 (separate from the standard suite)
const onchainFawkes = createFawkesClient(4001);

test.describe.serial("Uniswap On-Chain E2E (Anvil Fork)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });

    // Surface browser-side errors in the test output for easier debugging
    page.on("console", (msg) => {
      if (msg.type() === "error") console.log(`[BROWSER ERROR] ${msg.text()}`);
    });
    page.on("pageerror", (err) => console.log(`[PAGE ERROR] ${err.message}`));

    // Redirect Alchemy RPC reads to the local Anvil fork so wagmi hooks
    // (balances, delegates, proposal state) are consistent with what we write.
    await redirectRpcToAnvil(page);
    await mockVotableSupply(page);
  });

  // ---------------------------------------------------------------------------
  // ONCHAIN-001 — Delegation
  //
  // Connect as the a16z whale, open the delegation modal for a specific
  // delegate, confirm in the UI, let Fawkes broadcast to Anvil, then read
  // token.delegates(whale) from the fork and assert it changed.
  // ---------------------------------------------------------------------------
  test("ONCHAIN-001: delegate UNI on-chain and verify via Anvil", async ({
    page,
    context,
  }) => {
    // Reset the fork so repeated test runs always start from the same baseline
    await resetFork();

    // Give the whale ETH for gas on the fork
    await setEthBalance(WHALE_ADDRESS, "10");

    await setupFawkes(page, context, { address: WHALE_ADDRESS }, onchainFawkes);

    await page.goto("/delegates");
    await page.waitForLoadState("networkidle");

    // Click the "Delegate" button on the first delegate card
    const delegateBtn = page
      .locator('[data-testid="delegate-card"] button', { hasText: "Delegate" })
      .first();
    await expect(delegateBtn).toBeVisible({ timeout: 15_000 });
    await delegateBtn.click();

    // Wait for the delegation dialog to appear
    await expect(page.getByText(/as your delegate/i)).toBeVisible({
      timeout: 15_000,
    });

    // Confirm the delegation — dialog Delegate button is first in DOM (DialogProvider renders before children)
    const confirmBtn = page
      .getByRole("button", { name: /^Delegate$/i })
      .first();
    await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
    await confirmBtn.click();

    // Poll Fawkes until the eth_sendTransaction arrives, then approve
    await waitAndApproveRequest(onchainFawkes);

    // Wait for the success state in the UI
    await expect(
      page
        .getByText(/Delegation completed|completed!/i)
        .or(page.getByText(/submitted/i))
    ).toBeVisible({ timeout: 30_000 });

    // --- On-chain assertion ---
    const newDelegate = await getDelegate(WHALE_ADDRESS);
    expect(newDelegate.toLowerCase()).not.toBe(WHALE_ADDRESS.toLowerCase());
    console.log(
      `ONCHAIN-001 ✓  delegates(${WHALE_ADDRESS}) = ${newDelegate}  (was self)`
    );
  });

  // ---------------------------------------------------------------------------
  // ONCHAIN-002 — Proposal creation
  //
  // Connect as the whale (has >10 M UNI — above proposal threshold), fill the
  // governance proposal form, submit on-chain, let Fawkes sign, then read
  // governor.latestProposalIds(whale) from the fork to confirm it was created
  // and is in Pending state.
  // ---------------------------------------------------------------------------
  test("ONCHAIN-002: create a governance proposal on-chain and verify via Anvil", async ({
    page,
    context,
  }) => {
    await setEthBalance(WHALE_ADDRESS, "10");

    // Fund the whale from the Uniswap DAO treasury and self-delegate.
    // The whale's mainnet balance may be 0 at the fork block, so we transfer
    // 2 M UNI from the timelock (which always holds hundreds of millions).
    await fundWhaleWithUni(WHALE_ADDRESS);

    // Confirm whale is now above the proposal threshold
    const threshold = await getProposalThreshold();
    const balance = await getUniBalance(WHALE_ADDRESS);
    const votes = await getCurrentVotes(WHALE_ADDRESS);
    console.log(
      `ONCHAIN-002 pre-check  balance=${ethers.formatEther(balance)} UNI  votes=${ethers.formatEther(votes)} UNI  threshold=${ethers.formatEther(threshold)} UNI`
    );
    expect(votes).toBeGreaterThan(threshold);

    const proposalCountBefore = await getProposalCount();

    await setupFawkes(page, context, { address: WHALE_ADDRESS }, onchainFawkes);

    await page.goto("/proposals/create-proposal");
    await page.waitForLoadState("networkidle");

    // Switch to Governance Proposal if the toggle exists
    const gpToggle = page.getByRole("button", { name: /Governance Proposal/i });
    if (await gpToggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await gpToggle.click();
    }

    // Fill in the proposal title (uses react-hook-form name="title")
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible({ timeout: 10_000 });
    await titleInput.fill("E2E Onchain Test Proposal — Anvil Fork");

    // Fill description (MarkdownTextareaInput always uses name="proposalDescription")
    const descField = page.locator('textarea[name="proposalDescription"]');
    if (await descField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await descField.fill(
        "Automated governance proposal created by Playwright against a local Anvil fork of Ethereum mainnet."
      );
    }

    // Add a Transfer transaction — click the button, then fill the sub-form
    const addTransferBtn = page.getByRole("button", {
      name: /Transfer from the treasury/i,
    });
    if (await addTransferBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await addTransferBtn.click();

      // Recipient and amount fields are named by react-hook-form index
      const recipientField = page.locator(
        'input[name="transactions.0.recipient"]'
      );
      await expect(recipientField).toBeVisible({ timeout: 5_000 });
      await recipientField.fill("0x1a9C8182C09F50C8318d769245beA52c32BE35BC");

      const amountField = page.locator('input[name="transactions.0.amount"]');
      await amountField.fill("0");

      const txDescField = page.locator(
        'input[name="transactions.0.description"]'
      );
      if (await txDescField.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await txDescField.fill("No-op transfer for E2E test");
      }
    }

    // Submit on-chain
    const submitBtn = page
      .getByRole("button", { name: /Submit on-chain|Create proposal/i })
      .first();
    await expect(submitBtn).toBeVisible({ timeout: 15_000 });
    await submitBtn.click();

    // Poll Fawkes until the eth_sendTransaction arrives, then approve
    await waitAndApproveRequest(onchainFawkes);

    // The form navigates to "/" after success; wait for that redirect
    await page.waitForURL(/^\/$|\/proposals/, { timeout: 60_000 });

    // --- On-chain assertions ---
    const proposalCountAfter = await getProposalCount();
    expect(proposalCountAfter).toBeGreaterThan(proposalCountBefore);

    const proposalId = await getLatestProposalId(WHALE_ADDRESS);
    const state = await getProposalState(proposalId);
    expect(state).toBe(ProposalState.Pending);

    console.log(
      `ONCHAIN-002 ✓  proposalId=${proposalId}  state=Pending  count: ${proposalCountBefore} → ${proposalCountAfter}`
    );
  });

  // ---------------------------------------------------------------------------
  // ONCHAIN-003 — Vote casting
  //
  // This test depends on ONCHAIN-002 having run first (serial describe).
  // It mines blocks to push the proposal from Pending → Active, then casts
  // a For vote directly via Anvil impersonation and asserts hasVoted.
  //
  // NOTE: The newly created proposal is not indexed in the app DB, so a full
  // UI vote-flow test is not possible here.  The UI voting path for indexed
  // proposals is covered by the DELEGATION-003 / proposal-list test suite.
  // ---------------------------------------------------------------------------
  test("ONCHAIN-003: vote on an active proposal and verify via Anvil", async () => {
    // Retrieve the proposal created in ONCHAIN-002
    const proposalId = await getLatestProposalId(WHALE_ADDRESS);
    expect(proposalId).toBeGreaterThan(0n);

    // Mine past the voting delay so the proposal becomes Active
    const votingDelay = await getVotingDelay();
    await mineBlocks(votingDelay + 2);

    const stateAfterMining = await getProposalState(proposalId);
    expect(stateAfterMining).toBe(ProposalState.Active);
    console.log(
      `  proposal ${proposalId} is now Active after mining ${votingDelay + 2} blocks`
    );

    // Cast a "For" vote directly via Anvil impersonation (proposal is not in
    // the app DB, so the UI vote flow is not available for fork-only proposals)
    const provider = getAnvilProvider();
    await provider.send("anvil_impersonateAccount", [WHALE_ADDRESS]);
    const signer = await provider.getSigner(WHALE_ADDRESS);
    const governor = new ethers.Contract(
      UNI_GOVERNOR_ADDRESS,
      ["function castVote(uint256 proposalId, uint8 support)"],
      signer
    );
    const castTx = await governor.castVote(proposalId, 1); // 1 = For
    await castTx.wait(); // wait for the block to be mined
    await provider.send("anvil_stopImpersonatingAccount", [WHALE_ADDRESS]);

    // --- On-chain assertion ---
    const voted = await hasVoted(proposalId, WHALE_ADDRESS);
    expect(voted).toBe(true);

    console.log(
      `ONCHAIN-003 ✓  hasVoted(${proposalId}, ${WHALE_ADDRESS}) = true`
    );
  });
});
