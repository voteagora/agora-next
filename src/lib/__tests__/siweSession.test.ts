import { beforeEach, describe, expect, it } from "vitest";

import {
  clearStoredSiweSession,
  getStoredSiweJwt,
  getStoredSiweSession,
} from "@/lib/siweSession";

const STORAGE_KEY = "agora-siwe-jwt";

function createJwt(payload: Record<string, unknown>) {
  const encodePart = (value: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encodePart({ alg: "none", typ: "JWT" })}.${encodePart(
    payload
  )}.signature`;
}

describe("siweSession", () => {
  beforeEach(() => {
    clearStoredSiweSession();
  });

  it("returns null on expected-address mismatch without clearing the stored jwt", () => {
    const token = createJwt({
      siwe: {
        address: "0x1234567890123456789012345678901234567890",
        chainId: "1",
      },
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        access_token: token,
      })
    );

    expect(
      getStoredSiweSession({
        expectedAddress: "0x9999999999999999999999999999999999999999",
      })
    ).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify({
        access_token: token,
      })
    );
  });

  it("clears expired tokens", () => {
    const token = createJwt({
      siwe: {
        address: "0x1234567890123456789012345678901234567890",
        chainId: "1",
      },
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        access_token: token,
      })
    );

    expect(getStoredSiweJwt()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
