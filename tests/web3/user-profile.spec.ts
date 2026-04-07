import "../../tests/mockMediaLoader.js";
import { test } from "@playwright/test";
import Tenant from "../../src/lib/tenant/tenant";
test.describe("User Profile Scenarios", () => {
  // All these tests require the user to be logged in to access and edit their profile.
  // Since Synpress auth is pending for this branch, we skip them dynamically.

  test.beforeEach(async () => {});

  test("USER-PRO-001: View my profile link on logged in menu", async () => {
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-002: Edit delegate statement link on logged in menu", async () => {
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-003: delegates/create page contains a delegate statement editable text box", async () => {
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-004: delegates/create page contains a View Template link", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegate-statement-template")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-005: delegates/create page allows user to save social links", async () => {
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-006: delegates/create page code of conduct checkbox", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/code-of-conduct")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-007: delegates/create page DAO principles checkbox", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/dao-principles")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-008: delegates/create page email subscription checkbox", async () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("email-subscriptions")?.enabled)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-009: delegates/create page allows user to configure governance issues", async () => {
    const { ui } = Tenant.current();
    if (!ui.governanceIssues || ui.governanceIssues.length === 0)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress authentication flow");
  });

  test("USER-PRO-010: delegates/create page allows user to configure a represented stakeholder", async () => {
    const { ui } = Tenant.current();
    if (!ui.governanceStakeholders || ui.governanceStakeholders.length === 0)
      test.skip(true, "Tenant disabled this feature");
    test.skip(true, "Requires Synpress authentication flow");
  });
});
