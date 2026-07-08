import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain } from "@/lib/utils";
import { getPublicClient } from "@/lib/viem";
import {
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
]);

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
);

export async function burnMembershipNfts(owner: `0x${string}`) {
  const { contracts } = Tenant.current();
  const token = contracts.token;
  if (!token.isERC721() || token.address === zeroAddress) {
    return;
  }

  const tokenAddress = token.address as `0x${string}`;
  const publicClient = getPublicClient();

  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: membershipAbi,
    functionName: "balanceOf",
    args: [owner],
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

  // The contract is not enumerable, so token ids are recovered from mint
  // transfers and confirmed with ownerOf (which reverts for burned ids).
  const logs = await publicClient.getLogs({
    address: tokenAddress,
    event: transferEvent,
    args: { to: owner },
    // Civic token deploy block on Base; anchoring here keeps the scan
    // window small. Chunk the range if the RPC ever caps it.
    fromBlock: 48297405n,
    toBlock: "latest",
  });
  const candidateIds = [
    ...new Set(logs.map((log) => log.args.tokenId).filter(Boolean)),
  ] as bigint[];

  const ownedIds: bigint[] = [];
  for (const tokenId of candidateIds) {
    try {
      const currentOwner = await publicClient.readContract({
        address: tokenAddress,
        abi: membershipAbi,
        functionName: "ownerOf",
        args: [tokenId],
      });
      if (isAddressEqual(currentOwner, owner)) {
        ownedIds.push(tokenId);
      }
    } catch {
      // burned or invalid id
    }
    if (BigInt(ownedIds.length) === balance) {
      break;
    }
  }
  if (ownedIds.length === 0) {
    return;
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
}
