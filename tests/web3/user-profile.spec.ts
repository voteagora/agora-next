import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";
import { MockWallet } from "./utils/mockWallet";

test.describe("User Profile Scenarios", () => {
  let mockWallet: MockWallet;

  test.beforeEach(async ({ page }) => {
    // Generate a fresh random wallet for each test to avoid state bleeding
    // Use Hardhat Account 0 to be deterministic for Mock DAO node
    mockWallet = new MockWallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    // Inject the mock into the page
    await mockWallet.inject(page, 10); // 10 is Optimism ID

    // Suppress encouragement dialog
    await page.addInitScript(() => {
      sessionStorage.setItem("agora-delegation-dialog-shown", "true");
    });
  });

  const authenticateWallet = async (page: any) => {
    // Intercept SIWE endpoints so they don't hit the real Next.js API (which requires Redis)
    await page.route("**/api/v1/auth/nonce", async (route: any) => {
      await route.fulfill({ status: 200, json: { nonce: "mocknonce1234567890" } });
    });

    const mockJwtPayload = {
      siwe: {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        chainId: "10"
      },
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    // Create a dummy valid JWT (header.payload.signature)
    const validMockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(mockJwtPayload)).toString("base64")}.mocksignature`;

    await page.route("**/api/v1/auth/verify", async (route: any) => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: validMockJwt,
          expires_in: 3600,
          token_type: "Bearer"
        }
      });
    });

    await page.route("**/api/v1/auth/session", async (route: any) => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: validMockJwt,
          expires_in: 3600,
          token_type: "Bearer"
        }
      });
    });

    await page.goto("/delegates");
    await page.waitForLoadState("domcontentloaded");
    
    // Check if connected by looking for the profile dropdown button
    const profileDropdown = page.getByTestId("profile-dropdown-button");
    const isConnected = await profileDropdown.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isConnected) {
      const connectButton = page.getByTestId("connect-wallet-button");
      await connectButton.click();
      
      // Wait for the ConnectKit modal to appear
      await page.waitForTimeout(1000);
      const buttons = await page.locator("button").allTextContents();
      
      const targetButtonText = buttons.find((text: string) => /MetaMask|Browser Wallet|Injected/i.test(text));
      if (targetButtonText) {
        await page.locator("button").filter({ hasText: targetButtonText }).first().click();
      } else {
        await page.locator('.ck-wallet-option').first().click().catch(() => {});
      }
    }

    // Wait and verify we are connected
    await expect(profileDropdown).toBeVisible({ timeout: 10000 });

    // Open the dropdown to see if we need to Sign In with Ethereum
    await profileDropdown.click();
    await page.waitForTimeout(1000);

    const signInButton = page.getByText(/Sign in with Ethereum/i).first();
    const isSignInVisible = await signInButton.isVisible({ timeout: 2000 }).catch(() => false);
    console.log("SIWE button visible: ", isSignInVisible);
    if (isSignInVisible) {
      await signInButton.click();
      
      // Wait for ConnectKit specific SIWE modal to see if we need to click "Sign In" inside it
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "auth-status-ck-modal.png" });
      const ckSignInModalButton = page.getByRole("button", { name: /Sign In|Verify/i }).filter({ hasText: /^(Sign In|Verify)$/i }).first();
      if (await ckSignInModalButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await ckSignInModalButton.click();
        await page.waitForTimeout(2000);
      }
    } else {
      // It was already signed in (or SIWE not needed), so close the dropdown
      // so we don't pollute the test state!
      await profileDropdown.click();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: "auth-status-final.png" });
  };

  test("USER-PRO-001: View my profile or create statement link on logged in menu", async ({ page }) => {
    await authenticateWallet(page);

    const userMenuButton = page.getByTestId("profile-dropdown-button");
    await expect(userMenuButton).toBeVisible({ timeout: 15000 });
    
    // Check aria-expanded to know if the dropdown is open.
    const isExpanded = await userMenuButton.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await userMenuButton.click();
      await page.waitForTimeout(1000);
    }

    const profileLink = page.getByRole("link", { name: /(View my profile|Create delegate statement)/i });
    await expect(profileLink).toBeVisible({ timeout: 10000 });
  });

  test("USER-PRO-002: Logout link on logged in menu", async ({ page }) => {
    await authenticateWallet(page);

    const userMenuButton = page.getByTestId("profile-dropdown-button");
    await expect(userMenuButton).toBeVisible({ timeout: 15000 });
    
    // Check aria-expanded to know if the dropdown is open.
    const isExpanded = await userMenuButton.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await userMenuButton.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: "auth-status-pro002-final.png" });
    const logoutButton = page.getByText("Logout", { exact: true });
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
  });

  test("USER-PRO-003: delegates/create page contains a delegate statement editable text box", async ({ page }) => {
    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const statementBox = page.locator("textarea[name='delegateStatement']");
    await expect(statementBox).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-004: delegates/create page contains a View Template link", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegate-statement-template")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const templateLinks = page.locator("a", { hasText: /template/i });
    await expect(templateLinks.first()).toBeVisible();
  });

  test("USER-PRO-005: delegates/create page allows user to save social links", async ({ page }) => {
    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const twitterInput = page.locator("input[name='twitter']");
    const discordInput = page.locator("input[name='discord']");
    await expect(twitterInput).toBeVisible({ timeout: 15000 });
    await expect(discordInput).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-006: delegates/create page code of conduct checkbox", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/code-of-conduct")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const conductLabel = page.getByText(/agree with the/i).filter({ hasText: /code of conduct/i });
    await expect(conductLabel.first()).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-007: delegates/create page DAO principles checkbox", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/dao-principles")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const principlesLabel = page.getByText(/agree with the/i).filter({ hasText: /principles/i });
    await expect(principlesLabel.first()).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-008: delegates/create page email subscription checkbox", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("email-subscriptions")?.enabled)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const emailPref = page.locator("button[role='checkbox']").filter({ hasText: /Notify me/i }).or(page.locator("input[name='email']"));
    await expect(emailPref.first()).toBeVisible();
  });
  test("USER-PRO-009: delegates/create page allows user to configure governance issues", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.governanceIssues || ui.governanceIssues.length === 0)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const issuesHeader = page.getByRole("heading", { name: "Views on top issues" });
    await expect(issuesHeader).toBeVisible({ timeout: 15000 });
  });

  test("USER-PRO-010: delegates/create page allows user to configure a represented stakeholder", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.governanceStakeholders || ui.governanceStakeholders.length === 0)
      test.skip(true, "Tenant disabled this feature");

    await authenticateWallet(page);
    await page.goto("/delegates/create");
    await page.waitForLoadState("domcontentloaded");

    const stakeholderHeader = page.getByRole("heading", { name: "Top stakeholders" });
    await expect(stakeholderHeader).toBeVisible({ timeout: 15000 });
  });
});
