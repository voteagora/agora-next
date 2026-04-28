import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";

test.describe("Optimistic Proposals", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/proposals");
  });

  test("OPTIMISTIC-001: Optimistic Proposals in Proposal list", async ({
    page,
  }) => {
    test.skip(true, "Check for Optimistic Proposal by string in list");
  });

  test("OPTIMISTIC-002: optimistic proposal PENDING status", async ({
    page,
  }) => {
    test.skip(true, "Mock optimistic pending status");
  });

  test("OPTIMISTIC-003: optimistic proposal ACTIVE status", async ({
    page,
  }) => {
    test.skip(true, "Mock optimistic active status");
  });

  test("OPTIMISTIC-004: optimistic proposal in active status vote controls", async ({
    page,
  }) => {
    test.skip(true, "Verify only Against option exists");
  });

  test("OPTIMISTIC-005: optimistic proposal in active status vote against", async ({
    page,
  }) => {
    test.skip(true, "Submit Against vote via Synpress");
  });

  test("OPTIMISTIC-006: optimistic proposal SUCCEEDED status", async ({
    page,
  }) => {
    test.skip(true, "Verify succeeded UI");
  });

  test("OPTIMISTIC-007: optimistic proposal DEFEATED status", async ({
    page,
  }) => {
    test.skip(true, "Verify defeated UI when veto threshold met");
  });

  test("OPTIMISTIC-008: optimistic proposal CANCELLED status", async ({
    page,
  }) => {
    test.skip(true, "Verify cancelled UI");
  });

  test("OPTIMISTIC-009: optimistic proposal info box", async ({ page }) => {
    test.skip(true, "Verify veto explanation text");
  });
});
