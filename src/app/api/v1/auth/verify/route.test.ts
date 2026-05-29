import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiweMessage } from "siwe";

const appendServerTraceEventMock = vi.fn();
const verifyMessageMock = vi.fn();
const generateJwtMock = vi.fn();
const getRolesForUserMock = vi.fn();
const getExpiryMock = vi.fn();
const consumeSiweNonceMock = vi.fn();

vi.mock("@/lib/mirador/serverTrace", () => ({
  appendServerTraceEvent: appendServerTraceEventMock,
}));

vi.mock("@/lib/serverVerifyMessage", () => ({
  default: verifyMessageMock,
}));

vi.mock("@/lib/siweNonce.server", () => ({
  consumeSiweNonce: consumeSiweNonceMock,
}));

vi.mock("@/app/lib/auth/serverAuth", () => ({
  generateJwt: generateJwtMock,
  getRolesForUser: getRolesForUserMock,
  getExpiry: getExpiryMock,
}));

describe("POST /api/v1/auth/verify", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    verifyMessageMock.mockResolvedValue(true);
    getRolesForUserMock.mockResolvedValue(["member"]);
    getExpiryMock.mockResolvedValue(3600);
    generateJwtMock.mockResolvedValue("jwt-token");
    consumeSiweNonceMock.mockResolvedValue({
      ok: true,
      nonce: {
        host: "localhost",
      },
    });
  });

  it("passes the SIWE chain id through Safe-capable signature verification", async () => {
    const { POST } = await import("./route");
    const issuedAt = new Date(Date.now() - 60_000).toISOString();
    const expirationTime = new Date(Date.now() + 5 * 60_000).toISOString();

    const message = new SiweMessage({
      version: "1",
      domain: "localhost",
      uri: "http://localhost",
      statement: "Sign in to Agora with Ethereum",
      address: "0x1234567890123456789012345678901234567890",
      chainId: 10,
      nonce: "abcdef12",
      issuedAt,
      expirationTime,
    }).prepareMessage();

    const request = new Request("http://localhost/api/v1/auth/verify", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message,
        signature: "0xabc123",
      }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(verifyMessageMock).toHaveBeenCalledWith({
      address: "0x1234567890123456789012345678901234567890",
      message,
      signature: "0xabc123",
      chainId: 10,
      allowSafeContractSignature: true,
    });
    await expect(response.json()).resolves.toEqual({
      access_token: "jwt-token",
      token_type: "JWT",
      expires_in: 3600,
    });
  });
});
