import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCodeMock, getChainByIdMock } = vi.hoisted(() => ({
  getCodeMock: vi.fn(),
  getChainByIdMock: vi.fn(),
}));

vi.mock("@/lib/viem", () => ({
  getPublicClient: () => ({ getCode: getCodeMock }),
  getChainById: getChainByIdMock,
}));

import {
  classifyBytecode,
  getWalletAccountType,
} from "@/lib/wallet/walletType";

const DELEGATE = "7702cb554e6bfb442cb743a7df23154544a7176c";

describe("classifyBytecode", () => {
  it("treats empty code as an EOA", () => {
    expect(classifyBytecode(undefined)).toBe("eoa");
    expect(classifyBytecode(null)).toBe("eoa");
    expect(classifyBytecode("0x")).toBe("eoa");
  });

  it("recognises EIP-7702 delegation designators", () => {
    expect(classifyBytecode(`0xef0100${DELEGATE}`)).toBe(
      "eip7702-delegated-eoa"
    );
    expect(classifyBytecode(`0xEF0100${DELEGATE.toUpperCase()}`)).toBe(
      "eip7702-delegated-eoa"
    );
  });

  it("treats anything else as a contract", () => {
    expect(classifyBytecode("0x6080604052")).toBe("contract");
    expect(classifyBytecode(`0xef0100${DELEGATE}00`)).toBe("contract");
  });
});

describe("getWalletAccountType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getChainByIdMock.mockReturnValue({ id: 1 });
  });

  it("classifies from onchain code and caches per chain/address", async () => {
    getCodeMock.mockResolvedValue(`0xef0100${DELEGATE}`);
    const address = "0x1000000000000000000000000000000000000001";

    expect(await getWalletAccountType(address, 1)).toBe(
      "eip7702-delegated-eoa"
    );
    expect(await getWalletAccountType(address, 1)).toBe(
      "eip7702-delegated-eoa"
    );
    expect(getCodeMock).toHaveBeenCalledTimes(1);
  });

  it("returns unknown for unknown chains and RPC failures", async () => {
    getChainByIdMock.mockReturnValue(null);
    expect(
      await getWalletAccountType(
        "0x2000000000000000000000000000000000000002",
        999
      )
    ).toBe("unknown");

    getChainByIdMock.mockReturnValue({ id: 1 });
    getCodeMock.mockRejectedValue(new Error("rpc down"));
    expect(
      await getWalletAccountType(
        "0x3000000000000000000000000000000000000003",
        1
      )
    ).toBe("unknown");
  });
});
