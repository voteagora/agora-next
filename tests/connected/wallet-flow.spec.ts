import { BrowserContext, expect, test as baseTest } from "@playwright/test";
import dappwright, { Dappwright, MetaMaskWallet } from "@tenkeylabs/dappwright";

export const test = baseTest.extend<{
    context: BrowserContext;
    wallet: Dappwright;
}>({
    context: async ({ }, use) => {
        // Launch context with extension
        const [wallet, _, context] = await dappwright.bootstrap("", {
            wallet: "metamask",
            version: MetaMaskWallet.recommendedVersion,
            seed: "test test test test test test test test test test test junk", // Hardhat's default https://hardhat.org/hardhat-network/docs/reference#accounts
            headless: true,
        });

        await wallet.addNetwork({
            networkName: "OP Mainnet",
            rpc: "https://optimism.drpc.org",
            chainId: 10,
            symbol: "ETH",
        });

        await use(context);
    },

    wallet: async ({ context }, use) => {
        const metamask = await dappwright.getWallet("metamask", context);

        await use(metamask);
    },
});

test("should be able to connect", async ({ wallet, page }) => {
    await page.goto('/');
    await page.getByText('Connect Wallet').first().click();
    await page.getByRole('button', { name: 'MetaMask' }).click();
    await wallet.approve();
    await expect(page.getByText('0xf3...2266')).toBeVisible();
});