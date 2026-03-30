import { beforeEach, describe, expect, it, vi } from "vitest";

import { SIWE_NONCE_TTL_SECONDS } from "@/lib/constants";

const { delMock, expireMock, getMock, getdelMock, setMock, setnxMock } =
  vi.hoisted(() => ({
    delMock: vi.fn(),
    expireMock: vi.fn(),
    getMock: vi.fn(),
    getdelMock: vi.fn(),
    setMock: vi.fn(),
    setnxMock: vi.fn(),
  }));

vi.mock("@/lib/redis", () => ({
  default: {
    del: delMock,
    expire: expireMock,
    get: getMock,
    getdel: getdelMock,
    set: setMock,
    setnx: setnxMock,
  },
}));

describe("siweNonce.server", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("stores nonces with a single expiring set", async () => {
    setMock.mockResolvedValue("OK");

    const { storeSiweNonce } = await import("@/lib/siweNonce.server");

    const payload = await storeSiweNonce("nonce-123", "LOCALHOST");

    expect(payload).toMatchObject({
      host: "localhost",
      issuedAt: expect.any(String),
    });
    expect(setMock).toHaveBeenCalledWith(
      "siwe:nonce:active:nonce-123",
      payload,
      { ex: SIWE_NONCE_TTL_SECONDS }
    );
    expect(expireMock).not.toHaveBeenCalled();
  });

  it("marks consumed nonces atomically and returns replayed when already claimed", async () => {
    setMock.mockResolvedValueOnce(null);

    const { consumeSiweNonce } = await import("@/lib/siweNonce.server");

    await expect(consumeSiweNonce("nonce-123")).resolves.toEqual({
      ok: false,
      reason: "replayed",
    });
    expect(setMock).toHaveBeenCalledWith("siwe:nonce:consumed:nonce-123", "1", {
      nx: true,
      ex: SIWE_NONCE_TTL_SECONDS,
    });
    expect(getdelMock).not.toHaveBeenCalled();
    expect(expireMock).not.toHaveBeenCalled();
  });

  it("consumes the active nonce payload with getdel", async () => {
    setMock.mockResolvedValueOnce("OK");
    getdelMock.mockResolvedValueOnce({
      host: "localhost",
      issuedAt: "2026-03-30T18:00:00.000Z",
    });

    const { consumeSiweNonce } = await import("@/lib/siweNonce.server");

    await expect(consumeSiweNonce("nonce-123")).resolves.toEqual({
      ok: true,
      nonce: {
        host: "localhost",
        issuedAt: "2026-03-30T18:00:00.000Z",
      },
    });
    expect(getdelMock).toHaveBeenCalledWith("siwe:nonce:active:nonce-123");
    expect(getMock).not.toHaveBeenCalled();
    expect(delMock).not.toHaveBeenCalled();
  });
});
