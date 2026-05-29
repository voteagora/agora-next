import { Page } from "@playwright/test";
import { ANVIL_RPC_URL } from "./anvilClient";

/**
 * Redirects all Alchemy ETH-mainnet JSON-RPC calls to the local Anvil fork.
 * This ensures that wagmi reads (balances, delegates, proposal state) come
 * from the fork rather than live mainnet, making test assertions consistent.
 */
export async function redirectRpcToAnvil(page: Page): Promise<void> {
  await page.route(/alchemy\.com\/v2\//, async (route) => {
    const body = route.request().postData();
    try {
      const res = await fetch(ANVIL_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ?? undefined,
      });
      const json = await res.json();
      await route.fulfill({ json });
    } catch {
      await route.continue();
    }
  });
}

/**
 * Stubs the /api/common/votableSupply endpoint so the proposal form renders
 * correctly even if the dev DB is stale.
 */
export async function mockVotableSupply(
  page: Page,
  supply = "300000000000000000000000000"
): Promise<void> {
  await page.route("**/api/common/votableSupply*", (route) =>
    route.fulfill({
      json: { votableSupply: supply },
      status: 200,
    })
  );
}
