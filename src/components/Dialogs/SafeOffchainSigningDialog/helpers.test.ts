import { describe, expect, it } from "vitest";

import {
  getSafeVerifyingCopy,
  mergeSafeMessageConfirmations,
  shouldIgnoreLateSafeSiweResult,
} from "./helpers";

describe("SafeOffchainSigningDialog helpers", () => {
  it("keeps previously observed signer confirmations when a later poll regresses", () => {
    const mergedConfirmations = mergeSafeMessageConfirmations(
      [
        {
          owner: "0x1111111111111111111111111111111111111111",
          signature: "0xaaa",
          submittedAt: "2026-03-13T12:00:00.000Z",
        },
        {
          owner: "0x2222222222222222222222222222222222222222",
          signature: "0xbbb",
          submittedAt: "2026-03-13T12:01:00.000Z",
        },
      ],
      [
        {
          owner: "0x1111111111111111111111111111111111111111",
          signature: "0xaaa",
          submittedAt: "2026-03-13T12:00:00.000Z",
        },
      ]
    );

    expect(mergedConfirmations).toEqual([
      {
        owner: "0x1111111111111111111111111111111111111111",
        signature: "0xaaa",
        submittedAt: "2026-03-13T12:00:00.000Z",
      },
      {
        owner: "0x2222222222222222222222222222222222222222",
        signature: "0xbbb",
        submittedAt: "2026-03-13T12:01:00.000Z",
      },
    ]);
  });

  it("uses neutral verifying copy until the signer threshold is proven", () => {
    expect(
      getSafeVerifyingCopy({
        purpose: "notification_preferences",
        signingKind: "siwe",
        hasRequiredSignatures: false,
      })
    ).toEqual({
      title: "Verifying Safe signature",
      description:
        "Agora is checking the Safe sign-in response before it opens notification preferences.",
    });
  });

  it("ignores late Safe SIWE results after success or when a matching jwt exists", () => {
    expect(
      shouldIgnoreLateSafeSiweResult({
        completedSuccessfully: true,
        hasStoredJwt: false,
      })
    ).toBe(true);
    expect(
      shouldIgnoreLateSafeSiweResult({
        completedSuccessfully: false,
        hasStoredJwt: true,
      })
    ).toBe(true);
    expect(
      shouldIgnoreLateSafeSiweResult({
        completedSuccessfully: false,
        hasStoredJwt: false,
      })
    ).toBe(false);
  });
});
