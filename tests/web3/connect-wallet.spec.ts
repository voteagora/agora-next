import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";
import basicSetup from "./setup/basic.setup";

// Initialize the Test runner with the injected Metamask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test("should connect wallet to the Agora E2E Proxy and display correct address", async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  // Wait to initialize Metamask Context
  const metamask = new MetaMask(
    context,
    metamaskPage,
    basicSetup.walletPassword,
    extensionId
  );

  // Navigate to Agora Home Page
  await page.goto("/");

  // Look for the standard Wagmi RainbowKit "Connect Wallet" button
  await page.getByRole("button", { name: "Connect Wallet" }).first().click();

  // Accept and select Metamask inside the modal (assuming Rainbowkit "MetaMask" choice exists)
  // Our standard button might just say "MetaMask"
  await page.getByRole("button", { name: "MetaMask" }).click();

  // Switch to the MetaMask page to authorize the connection
  await metamask.connectToDapp();

  // Wait for SIWE nonce/signature validation logic
  // The 'Verify Account' button might show up if SIWE expects a signature
  // We'll assert that the specific address is rendered in the global header
  await expect(page.getByText("0x8952...8DC1").first()).toBeVisible();
});
