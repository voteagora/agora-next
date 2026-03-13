import { afterEach, describe, expect, it } from "vitest";

import {
  getDelegateStatementAuthMode,
  isDelegateStatementSiweAuthMode,
} from "../delegateStatement/auth";

const originalDelegateStatementAuthMode =
  process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE;
const originalSiweEnabled = process.env.NEXT_PUBLIC_SIWE_ENABLED;

describe("delegateStatement auth mode", () => {
  afterEach(() => {
    if (originalDelegateStatementAuthMode === undefined) {
      delete process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE;
    } else {
      process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE =
        originalDelegateStatementAuthMode;
    }

    if (originalSiweEnabled === undefined) {
      delete process.env.NEXT_PUBLIC_SIWE_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_SIWE_ENABLED = originalSiweEnabled;
    }
  });

  it("defaults to signed-message auth when no mode is configured", () => {
    delete process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE;
    delete process.env.NEXT_PUBLIC_SIWE_ENABLED;

    expect(getDelegateStatementAuthMode()).toBe("signed_message");
    expect(isDelegateStatementSiweAuthMode()).toBe(false);
  });

  it("falls back to signed-message auth when SIWE mode is configured but SIWE is disabled", () => {
    process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE = "siwe_jwt";
    delete process.env.NEXT_PUBLIC_SIWE_ENABLED;

    expect(getDelegateStatementAuthMode()).toBe("signed_message");
    expect(isDelegateStatementSiweAuthMode()).toBe(false);
  });

  it("keeps SIWE auth enabled when both flags are enabled", () => {
    process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE = "siwe_jwt";
    process.env.NEXT_PUBLIC_SIWE_ENABLED = "true";

    expect(getDelegateStatementAuthMode()).toBe("siwe_jwt");
    expect(isDelegateStatementSiweAuthMode()).toBe(true);
  });
});
