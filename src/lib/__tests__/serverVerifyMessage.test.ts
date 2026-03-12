import { beforeEach, describe, expect, it, vi } from "vitest";

const getChainByIdMock = vi.fn();
const getPublicClientMock = vi.fn();
const getCanonicalSafeMessageHashMock = vi.fn();

vi.mock("@/lib/viem", () => ({
  getChainById: getChainByIdMock,
  getPublicClient: getPublicClientMock,
}));

vi.mock("@/lib/safeMessages", () => ({
  getCanonicalSafeMessageHash: getCanonicalSafeMessageHashMock,
}));

describe("serverVerifyMessage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("verifies regular EOA signatures without entering the Safe path", async () => {
    const publicClient = {
      verifyMessage: vi.fn().mockResolvedValue(true),
      getBytecode: vi.fn(),
      readContract: vi.fn(),
    };
    getPublicClientMock.mockReturnValue(publicClient);

    const { default: verifyMessage } = await import("@/lib/serverVerifyMessage");

    await expect(
      verifyMessage({
        address: "0x1234567890123456789012345678901234567890",
        message: "hello",
        signature: "0xabc123",
      })
    ).resolves.toBe(true);

    expect(publicClient.getBytecode).not.toHaveBeenCalled();
    expect(getCanonicalSafeMessageHashMock).not.toHaveBeenCalled();
  });

  it("verifies Safe signatures against the canonical Safe hash on the provided chain", async () => {
    const publicClient = {
      verifyMessage: vi.fn().mockResolvedValue(false),
      getBytecode: vi.fn().mockResolvedValue("0x1234"),
      readContract: vi.fn().mockResolvedValue("0x1626ba7e"),
    };

    getChainByIdMock.mockReturnValue({ id: 10, name: "Optimism" });
    getPublicClientMock.mockReturnValue(publicClient);
    getCanonicalSafeMessageHashMock.mockResolvedValue(
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );

    const { default: verifyMessage } = await import("@/lib/serverVerifyMessage");

    await expect(
      verifyMessage({
        address: "0x1234567890123456789012345678901234567890",
        chainId: 10,
        message: "hello",
        signature: "0xabc123",
        allowSafeContractSignature: true,
      })
    ).resolves.toBe(true);

    expect(getChainByIdMock).toHaveBeenCalledWith(10);
    expect(getCanonicalSafeMessageHashMock).toHaveBeenCalledWith({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 10,
      message: "hello",
    });
    expect(publicClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "0x1234567890123456789012345678901234567890",
        functionName: "isValidSignature",
        args: [
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "0xabc123",
        ],
      })
    );
  });
});
