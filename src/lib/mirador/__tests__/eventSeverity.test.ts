import { describe, expect, it } from "vitest";

import {
  inferMiradorEventSeverity,
  isWalletTransportError,
} from "../eventSeverity";

describe("isWalletTransportError", () => {
  it("flags WalletConnect relay publish failures", () => {
    expect(
      isWalletTransportError({
        error:
          "An unknown RPC error occurred.\n\nDetails: Failed to publish payload, please try again. id:1781015326667018240 tag:1108\nVersion: viem@2.39.0",
      })
    ).toBe(true);
  });

  it("flags viem HTTP client errors from a wallet RPC", () => {
    expect(
      isWalletTransportError({
        error:
          "An unknown RPC error occurred.\n\nDetails: RPC endpoint returned HTTP client error.\nVersion: viem@2.39.0",
      })
    ).toBe(true);
  });

  it("flags JSON-RPC id mismatches via the viem detail line", () => {
    expect(
      isWalletTransportError({
        error:
          "An unknown RPC error occurred.\n\nDetails: Invalid Id\nVersion: viem@2.39.0",
      })
    ).toBe(true);
  });

  it("does not flag ordinary failures or reverts", () => {
    expect(
      isWalletTransportError({
        error: "Unexpected vote receipt status: reverted",
      })
    ).toBe(false);
    expect(
      isWalletTransportError({
        error: "execution reverted: voter already voted",
      })
    ).toBe(false);
  });
});

describe("inferMiradorEventSeverity", () => {
  it("downgrades wallet-transport failures to warn, even on a _failed event", () => {
    expect(
      inferMiradorEventSeverity("governance_vote_failed", {
        error:
          "An unknown RPC error occurred.\n\nDetails: Failed to publish payload, please try again. id:1 tag:1108",
      })
    ).toBe("warn");
  });

  it("keeps user cancellation as info even when wrapped as an RPC error", () => {
    expect(
      inferMiradorEventSeverity("governance_vote_failed", {
        error:
          "An unknown RPC error occurred.\n\nDetails: User rejected the request.",
      })
    ).toBe("info");
  });

  it("treats dismissed SIWE sign-in as info", () => {
    expect(
      inferMiradorEventSeverity("siwe_login_cancelled", {
        reason: "sign_in_dismissed",
      })
    ).toBe("info");
  });

  it("still reports genuine failures as error", () => {
    expect(
      inferMiradorEventSeverity("governance_vote_failed", {
        error: "Unexpected vote receipt status: reverted",
      })
    ).toBe("error");
  });
});
