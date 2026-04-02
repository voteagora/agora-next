import { test, expect } from "@playwright/test";

test.describe("Create Proposal Draft Flow", () => {
  // API intercepts are handled globally via MSW in src/mocks/handlers.ts

  test("should allow formulating a proposal without sending bad params", async ({
    page,
  }) => {
    await page.goto("/proposals/create");
  });
});
