import "../../tests/mockMediaLoader.js";
import { test, expect } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";

test.describe("OODAO Proposals (Temp Check & Governance)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/proposals/create-proposal");
  });

  test("TC-CREATE-003: Create temp check permissions", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress auth and VP check");
  });

  test("TC-CREATE-004: Temp check creation", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress to sign transaction");
  });

  test("TC-CREATE-005: Create temp check proposal type", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires dropdown interaction");
  });

  test("TC-CREATE-006: Create temp check related discussions", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires related discussions popup flow");
  });

  test("TC-CREATE-007: Create temp check related discussions popup", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires popup search logic");
  });

  test("GP-CREATE-003: Create governance proposal permissions", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires auth and related temp check author check");
  });

  test("GP-CREATE-004: Governance Proposal creation", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(
      true,
      "Requires submitting full gov proposal via fawkes/synpress"
    );
  });

  test("GP-CREATE-005: Create proposal proposal type", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Verify dropdown is populated with temp check type");
  });

  test("GP-CREATE-006: Create Proposal related discussions", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Verify add reference for forums on gov proposals");
  });

  test("GP-CREATE-007: Create Proposal related temp check", async ({
    page,
  }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Verify temp check attachment");
  });

  test("GP-CREATE-008: Proposal related temp check popup", async ({ page }) => {
    const { ui } = Tenant.current();
    if (!ui.toggle("has-eas-oodao")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Search for successful temp checks");
  });
});
