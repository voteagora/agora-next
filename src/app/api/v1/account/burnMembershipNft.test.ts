import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BaseError,
  ContractFunctionRevertedError,
  encodeErrorResult,
  parseAbi,
} from "viem";
import { burnMembershipNfts } from "./burnMembershipNft";

const { client, writeContract } = vi.hoisted(() => ({
  client: {
    getBlockNumber: vi.fn(),
    readContract: vi.fn(),
    getLogs: vi.fn(),
    simulateContract: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
  },
  writeContract: vi.fn(),
}));

vi.mock("@/lib/viem", () => ({ getPublicClient: () => client }));
vi.mock("@/lib/utils", () => ({ getTransportForChain: vi.fn() }));
vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      contracts: {
        token: {
          address: "0x2d0886464a7175a6d7b10aaa6942c49232bd8d1f",
          chain: { id: 8453 },
          isERC721: () => true,
        },
      },
    }),
  },
}));
vi.mock("viem", async (importOriginal) => ({
  ...(await importOriginal<typeof import("viem")>()),
  createWalletClient: () => ({ writeContract }),
}));

const OWNER = "0xedc0720e5c529ca25204363e2c51e809350ddb5c";
const DEPLOY_BLOCK = 48_296_940n;
const HEAD = DEPLOY_BLOCK + 25_000n;
const HASH = `0x${"ab".repeat(32)}`;
const errorAbi = parseAbi(["error NonexistentToken(uint256 tokenId)"]);
let ownedIds: Set<bigint>;
let transfers: Array<{ block: bigint; tokenId?: bigint }>;

describe("burnMembershipNfts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("MEMBERSHIP_BURNER_PK", `0x${"01".repeat(32)}`);
    ownedIds = new Set([12n]);
    transfers = [{ block: DEPLOY_BLOCK + 10_000n, tokenId: 12n }];
    client.getBlockNumber.mockResolvedValue(HEAD);
    client.readContract.mockImplementation(({ functionName, args, abi }) => {
      if (functionName === "balanceOf") return BigInt(ownedIds.size);
      const tokenId = args[0];
      if (ownedIds.has(tokenId)) return OWNER;
      throw new BaseError("Contract call failed", {
        cause: new ContractFunctionRevertedError({
          abi,
          data: encodeErrorResult({
            abi: errorAbi,
            errorName: "NonexistentToken",
            args: [tokenId],
          }),
          functionName: "ownerOf",
        }),
      });
    });
    client.getLogs.mockImplementation(
      ({
        fromBlock,
        toBlock,
      }: {
        fromBlock: bigint;
        toBlock: bigint | "latest";
      }) => {
        const end = toBlock === "latest" ? HEAD : toBlock;
        if (end - fromBlock + 1n > 10_000n) {
          throw new Error("getLogs request exceeded max allowed range");
        }
        return transfers
          .filter(({ block }) => block >= fromBlock && block <= end)
          .map(({ tokenId }) => ({ args: { tokenId } }));
      }
    );
    client.simulateContract.mockImplementation((request) => ({ request }));
    writeContract.mockImplementation(({ args }) => {
      ownedIds.delete(args[0]);
      return HASH;
    });
    client.waitForTransactionReceipt.mockResolvedValue({ status: "success" });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("pages within the RPC limit and stops once every owned token is found", async () => {
    await burnMembershipNfts(OWNER);

    expect(
      client.getLogs.mock.calls.map(([{ fromBlock, toBlock }]) => [
        fromBlock,
        toBlock,
      ])
    ).toEqual([
      [HEAD - 9_999n, HEAD],
      [HEAD - 19_999n, HEAD - 10_000n],
    ]);
    expect(writeContract).toHaveBeenCalledOnce();
    expect(writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ args: [12n] })
    );
    const reads = client.readContract.mock.calls.map(([request]) => request);
    expect(
      reads.slice(0, -1).every((request) => request.blockNumber === HEAD)
    ).toBe(true);
    expect(reads.at(-1)).toMatchObject({
      functionName: "balanceOf",
      args: [OWNER],
    });
    expect(reads.at(-1)).not.toHaveProperty("blockNumber");
  });

  it("covers page boundaries and the deployment block, retaining token zero and deduplicating IDs", async () => {
    transfers = [0n, 5_000n, 5_001n, 15_000n, 15_001n, 25_000n].map(
      (offset, index) => ({
        block: DEPLOY_BLOCK + offset,
        tokenId: BigInt(index),
      })
    );
    ownedIds = new Set(transfers.map(({ tokenId }) => tokenId!));
    transfers.push(transfers[4], { block: HEAD });

    await burnMembershipNfts(OWNER);

    expect(client.getLogs).toHaveBeenCalledTimes(3);
    expect(client.getLogs).toHaveBeenLastCalledWith(
      expect.objectContaining({
        fromBlock: DEPLOY_BLOCK,
        toBlock: DEPLOY_BLOCK + 5_000n,
      })
    );
    expect(
      writeContract.mock.calls.map(([{ args }]) => args[0]).sort()
    ).toEqual([0n, 1n, 2n, 3n, 4n, 5n]);
  });

  it("skips the decoded NonexistentToken error for a previously burned token", async () => {
    transfers.push({ block: HEAD, tokenId: 99n });

    await burnMembershipNfts(OWNER);

    expect(client.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "ownerOf",
        args: [99n],
      })
    );
    expect(writeContract).toHaveBeenCalledOnce();
  });

  it.each(["logs", "ownership", "unexpected revert"])(
    "propagates %s errors without submitting burns",
    async (failure) => {
      const error =
        failure === "unexpected revert"
          ? new ContractFunctionRevertedError({
              abi: errorAbi,
              functionName: "ownerOf",
              message: "execution reverted",
            })
          : new Error("RPC unavailable");
      if (failure === "logs") client.getLogs.mockRejectedValue(error);
      else
        client.readContract.mockImplementation(({ functionName }) => {
          if (functionName === "balanceOf") return 1n;
          throw error;
        });

      await expect(burnMembershipNfts(OWNER)).rejects.toBe(error);
      expect(writeContract).not.toHaveBeenCalled();
    }
  );

  it.each([false, true])(
    "rejects incomplete discovery before burning (partial: %s)",
    async (partial) => {
      if (partial) ownedIds.add(13n);
      else transfers = [];

      await expect(burnMembershipNfts(OWNER)).rejects.toThrow(
        "Could not find all membership NFTs"
      );
      expect(writeContract).not.toHaveBeenCalled();
    }
  );

  it("rejects a failed burn receipt", async () => {
    client.waitForTransactionReceipt.mockResolvedValue({ status: "reverted" });

    await expect(burnMembershipNfts(OWNER)).rejects.toThrow(
      "Membership NFT burn reverted"
    );
  });

  it("rejects deletion when the post-burn balance remains positive", async () => {
    writeContract.mockResolvedValue(HASH);

    await expect(burnMembershipNfts(OWNER)).rejects.toThrow(
      "Membership NFT balance is not zero after burning"
    );
  });

  it("skips discovery and signing for a zero-balance retry", async () => {
    ownedIds.clear();
    vi.stubEnv("MEMBERSHIP_BURNER_PK", "");

    await burnMembershipNfts(OWNER);

    expect(client.getLogs).not.toHaveBeenCalled();
    expect(writeContract).not.toHaveBeenCalled();
  });
});
