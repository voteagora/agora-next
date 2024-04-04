import { test } from "@playwright/test";

test.describe('homepage desktop', () => {
    test('connect wallet button', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Connect Wallet').first().click();
        await page.getByRole('button', { name: 'MetaMask' }).click();
        await page.getByLabel('Close').click();
        await page.getByText('Connect Wallet').first().click();
        await page.getByRole('button', { name: 'Coinbase Wallet' }).click();
        await page.getByLabel('Close').click();
        await page.getByText('Connect Wallet').first().click();
        await page.getByRole('button', { name: 'Other Wallets' }).click();
        await page.getByLabel('Close').click();
    });

    test('two', async ({ page }) => {
        // ...
    });

    // TODO: count proposals and check something more

    // TODO: think about this and how to handle navigation to another page
    // const tenantExpectedTextMapping: { [key: string]: string } = {
    //     optimism: "Optimism voters",
    //     ens: "ENS voters",
    //     etherfi: "EtherFi voters",
    //     lyra: "Lyra voters",
    //   };

    //   const expectedText = tenantExpectedTextMapping[tenant];

    //   await page.getByRole("link", { name: "Voters" }).click();
    //   await page.waitForURL("**/delegates");
    //   await expect(page.locator("h1")).toContainText(expectedText);
});