import { describe, expect, it } from "vitest";

import { isDelegateStatementSiweAuthMode } from "../delegateStatement/auth";

describe("delegateStatement auth mode", () => {
  it("always uses SIWE JWT auth", () => {
    expect(isDelegateStatementSiweAuthMode()).toBe(true);
  });
});
