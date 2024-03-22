import { test, expect } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
const validTenants = ["optimism", "ens", "etherfi", "lyra"];
const tenant: string = process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME || "";

if (!validTenants.includes(tenant)) {
  throw new Error(
    `NEXT_PUBLIC_AGORA_INSTANCE_NAME must be one of ${validTenants.join(
      ", "
    )}, but got '${tenant}'`
  );
}

test.describe("Smoke test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("should navigate to the Delegates page via Voters link", async ({
    page,
  }) => {
    const tenantExpectedTextMapping: { [key: string]: string } = {
      optimism: "Optimism voters",
      ens: "ENS voters",
      etherfi: "EtherFi voters",
      lyra: "Lyra voters",
    };

    const expectedText = tenantExpectedTextMapping[tenant];

    await page.getByRole("link", { name: "Voters" }).click();
    await page.waitForURL("**/delegates");
    await expect(page.locator("h1")).toContainText(expectedText);
  });
});
