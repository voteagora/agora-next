import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain } from "@/lib/utils";
import { getPublicClient } from "@/lib/viem";
import {
  BaseError,
  ContractFunctionRevertedError,
  createWalletClient,
  isAddressEqual,
  isHex,
  parseAbi,
  parseAbiItem,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// The generated Membership__factory ABI is stale vs. the deployed contract
// (it has safeMint(address); the chain has mint(address[])), so the calls we
// need are declared inline against the verified deployed source.
const membershipAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function burn(uint256 tokenId)",
  "error NonexistentToken(uint256 tokenId)",
]);

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
);

const DEPLOYMENT_BLOCK = 48_296_940n; // Civic membership token on Base
const LOG_BLOCK_RANGE = 10_000n; // Goldsky's supported query range

export async function burnMembershipNfts(owner: `0x${string}`) {
  const { contracts } = Tenant.current();
  const token = contracts.token;
  if (!token.isERC721() || token.address === zeroAddress) {
    return;
  }

  const tokenAddress = token.address as `0x${string}`;
  const publicClient = getPublicClient();
  const blockNumber = await publicClient.getBlockNumber();

  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: membershipAbi,
    functionName: "balanceOf",
    args: [owner],
    blockNumber,
  });
  if (balance === 0n) {
    return;
  }

  const burnerKey = process.env.MEMBERSHIP_BURNER_PK;
  if (!burnerKey || !isHex(burnerKey)) {
    throw new Error(
      "MEMBERSHIP_BURNER_PK is missing but the account owns a membership NFT"
    );
  }

  // The token is not enumerable. Search recent transfers first and confirm
  // ownership at the same block as the balance, skipping previously burned ids.
  // ponytail: history scans grow with token age; use indexed ids if they outgrow the request timeout.
  const ownedIds: bigint[] = [];
  const seenIds = new Set<bigint>();
  let toBlock = blockNumber;
  while (toBlock >= DEPLOYMENT_BLOCK && BigInt(ownedIds.length) < balance) {
    const start = toBlock - LOG_BLOCK_RANGE + 1n;
    const fromBlock = start < DEPLOYMENT_BLOCK ? DEPLOYMENT_BLOCK : start;
    const logs = await publicClient.getLogs({
      address: tokenAddress,
      event: transferEvent,
      args: { to: owner },
      fromBlock,
      toBlock,
    });

    for (const {
      args: { tokenId },
    } of logs) {
      if (tokenId === undefined || seenIds.has(tokenId)) continue;
      seenIds.add(tokenId);
      try {
        const currentOwner = await publicClient.readContract({
          address: tokenAddress,
          abi: membershipAbi,
          functionName: "ownerOf",
          args: [tokenId],
          blockNumber,
        });
        if (isAddressEqual(currentOwner, owner)) {
          ownedIds.push(tokenId);
        }
      } catch (error) {
        if (
          error instanceof BaseError &&
          error.walk(
            (cause) =>
              cause instanceof ContractFunctionRevertedError &&
              cause.data?.errorName === "NonexistentToken"
          )
        ) {
          continue;
        }
        throw error;
      }
      if (BigInt(ownedIds.length) === balance) {
        break;
      }
    }
    toBlock = fromBlock - 1n;
  }
  if (BigInt(ownedIds.length) !== balance) {
    throw new Error(
      `Could not find all membership NFTs (found ${ownedIds.length}, expected ${balance})`
    );
  }

  const account = privateKeyToAccount(burnerKey);
  const walletClient = createWalletClient({
    account,
    chain: token.chain,
    transport: getTransportForChain(token.chain.id)!,
  });

  for (const tokenId of ownedIds) {
    const { request } = await publicClient.simulateContract({
      address: tokenAddress,
      abi: membershipAbi,
      functionName: "burn",
      args: [tokenId],
      account,
    });
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(
        `Membership NFT burn reverted (tokenId ${tokenId}, tx ${hash})`
      );
    }
  }

  const remainingBalance = await publicClient.readContract({
    address: tokenAddress,
    abi: membershipAbi,
    functionName: "balanceOf",
    args: [owner],
  });
  if (remainingBalance !== 0n) {
    throw new Error("Membership NFT balance is not zero after burning");
  }
}
