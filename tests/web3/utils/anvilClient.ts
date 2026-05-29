import { ethers } from "ethers";

export const ANVIL_RPC_URL = "http://127.0.0.1:8546";

// Same Alchemy key used by playwright.onchain.config.ts for the fork
const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID ?? "";
export const MAINNET_FORK_RPC = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`;

// Mainnet Uniswap contracts (prod)
export const UNI_TOKEN_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
export const UNI_GOVERNOR_ADDRESS =
  "0x408ED6354d4973f66138C91495F2f2FCbd8724C3";
export const UNI_TIMELOCK_ADDRESS =
  "0x1a9C8182C09F50C8318d769245beA52c32BE35BC";

// a16z — ~14M UNI on mainnet, well above proposal threshold
export const WHALE_ADDRESS = "0x2b591e99af9bd2ad008d0e17fc3be708e9ccab0f";

// Governor Bravo proposal states
export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

const UNI_TOKEN_ABI = [
  "function delegates(address account) external view returns (address)",
  "function balanceOf(address account) external view returns (uint256)",
  "function getCurrentVotes(address account) external view returns (uint96)",
];

const GOVERNOR_ABI = [
  "function state(uint256 proposalId) external view returns (uint8)",
  "function proposalCount() external view returns (uint256)",
  // Uniswap Governor Bravo exposes getReceipt, not hasVoted
  "function getReceipt(uint256 proposalId, address voter) external view returns (bool hasVoted, bool support, uint96 votes)",
  "function votingDelay() external view returns (uint256)",
  "function votingPeriod() external view returns (uint256)",
  "function proposalThreshold() external view returns (uint256)",
  "function latestProposalIds(address proposer) external view returns (uint256)",
];

export function getAnvilProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(ANVIL_RPC_URL);
}

/** Returns the address this account has delegated their votes to. */
export async function getDelegate(address: string): Promise<string> {
  const provider = getAnvilProvider();
  const token = new ethers.Contract(UNI_TOKEN_ADDRESS, UNI_TOKEN_ABI, provider);
  return token.delegates(address);
}

/** Returns the current UNI balance (in wei) for an address on the fork. */
export async function getUniBalance(address: string): Promise<bigint> {
  const provider = getAnvilProvider();
  const token = new ethers.Contract(UNI_TOKEN_ADDRESS, UNI_TOKEN_ABI, provider);
  return token.balanceOf(address);
}

/** Returns the current voting power (in raw units) for an address. */
export async function getCurrentVotes(address: string): Promise<bigint> {
  const provider = getAnvilProvider();
  const token = new ethers.Contract(UNI_TOKEN_ADDRESS, UNI_TOKEN_ABI, provider);
  return token.getCurrentVotes(address);
}

/** Returns the Uniswap Governor's proposal threshold. */
export async function getProposalThreshold(): Promise<bigint> {
  const provider = getAnvilProvider();
  const governor = new ethers.Contract(
    UNI_GOVERNOR_ADDRESS,
    GOVERNOR_ABI,
    provider
  );
  return governor.proposalThreshold();
}

/** Returns the Governor Bravo proposal state enum value. */
export async function getProposalState(proposalId: bigint): Promise<number> {
  const provider = getAnvilProvider();
  const governor = new ethers.Contract(
    UNI_GOVERNOR_ADDRESS,
    GOVERNOR_ABI,
    provider
  );
  return Number(await governor.state(proposalId));
}

/** Returns the total number of proposals ever submitted. */
export async function getProposalCount(): Promise<bigint> {
  const provider = getAnvilProvider();
  const governor = new ethers.Contract(
    UNI_GOVERNOR_ADDRESS,
    GOVERNOR_ABI,
    provider
  );
  return governor.proposalCount();
}

/** Returns the most recent proposal ID created by a given address. */
export async function getLatestProposalId(proposer: string): Promise<bigint> {
  const provider = getAnvilProvider();
  const governor = new ethers.Contract(
    UNI_GOVERNOR_ADDRESS,
    GOVERNOR_ABI,
    provider
  );
  return governor.latestProposalIds(proposer);
}

/** Returns true if the voter has cast a vote on this proposal. */
export async function hasVoted(
  proposalId: bigint,
  voter: string
): Promise<boolean> {
  const provider = getAnvilProvider();
  const governor = new ethers.Contract(
    UNI_GOVERNOR_ADDRESS,
    GOVERNOR_ABI,
    provider
  );
  const receipt = await governor.getReceipt(proposalId, voter);
  return receipt.hasVoted as boolean;
}

/** Mine N blocks instantly on the Anvil fork. */
export async function mineBlocks(count: number): Promise<void> {
  const provider = getAnvilProvider();
  await provider.send("anvil_mine", [ethers.toQuantity(count)]);
}

/** Set ETH balance for an address (useful to cover gas). */
export async function setEthBalance(
  address: string,
  ether: string
): Promise<void> {
  const provider = getAnvilProvider();
  await provider.send("anvil_setBalance", [
    address,
    ethers.toQuantity(ethers.parseEther(ether)),
  ]);
}

/** Returns the number of blocks to mine to move a proposal from Pending → Active. */
export async function getVotingDelay(): Promise<number> {
  const provider = getAnvilProvider();
  const governor = new ethers.Contract(
    UNI_GOVERNOR_ADDRESS,
    GOVERNOR_ABI,
    provider
  );
  return Number(await governor.votingDelay());
}

/**
 * Fetch a transaction receipt from Anvil and return { status, revertReason }.
 * Useful for diagnosing why a submitted transaction didn't change state.
 */
export async function getTxStatus(
  txHash: string
): Promise<{ status: number; revertData?: string }> {
  const provider = getAnvilProvider();
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) return { status: -1 };
  if (receipt.status === 1) return { status: 1 };

  // Replay the transaction to get the revert reason
  try {
    const tx = await provider.getTransaction(txHash);
    if (tx) {
      await provider.call({
        to: tx.to ?? undefined,
        from: tx.from,
        data: tx.data,
        value: tx.value,
        gasLimit: tx.gasLimit,
      });
    }
  } catch (err: any) {
    return { status: 0, revertData: err?.message ?? String(err) };
  }
  return { status: 0 };
}

/**
 * Reset the Anvil fork to its clean initial state.  Call this at the start of
 * the first test in a serial suite so repeated test runs begin from the same
 * baseline regardless of whether the Anvil process was reused.
 */
export async function resetFork(): Promise<void> {
  const provider = getAnvilProvider();
  await provider.send("anvil_reset", [
    { forking: { jsonRpcUrl: MAINNET_FORK_RPC } },
  ]);
}

/**
 * Transfer UNI from the Uniswap DAO timelock (which holds hundreds of millions
 * of UNI) to `recipient` using anvil_impersonateAccount.  Then self-delegate
 * so the recipient's votes are active immediately.
 *
 * Call this instead of relying on `WHALE_ADDRESS` holding UNI on mainnet —
 * that balance changes over time and may be 0 at the fork block.
 */
export async function fundWhaleWithUni(
  recipient: string,
  amount: bigint = ethers.parseEther("2000000")
): Promise<void> {
  const provider = getAnvilProvider();

  // Give the timelock some ETH to pay for gas
  await provider.send("anvil_setBalance", [
    UNI_TIMELOCK_ADDRESS,
    ethers.toQuantity(ethers.parseEther("10")),
  ]);

  // Impersonate the timelock
  await provider.send("anvil_impersonateAccount", [UNI_TIMELOCK_ADDRESS]);
  const signer = await provider.getSigner(UNI_TIMELOCK_ADDRESS);

  const token = new ethers.Contract(
    UNI_TOKEN_ADDRESS,
    ["function transfer(address to, uint256 amount) returns (bool)"],
    signer
  );
  const transferTx = await token.transfer(recipient, amount);
  await transferTx.wait();

  await provider.send("anvil_stopImpersonatingAccount", [UNI_TIMELOCK_ADDRESS]);

  // Self-delegate so the newly received tokens immediately count as votes
  await directDelegate(recipient, recipient);
}

/**
 * Directly send a `delegate(to)` call on behalf of `from` using
 * anvil_impersonateAccount — no UI needed, no wallet connection required.
 * Use this to restore the whale's self-delegated votes between tests.
 */
export async function directDelegate(from: string, to: string): Promise<void> {
  const provider = getAnvilProvider();
  await provider.send("anvil_impersonateAccount", [from]);
  const signer = await provider.getSigner(from);
  const token = new ethers.Contract(
    UNI_TOKEN_ADDRESS,
    ["function delegate(address) external"],
    signer
  );
  const tx = await token.delegate(to);
  await tx.wait(); // wait for the block to be mined before returning
  await provider.send("anvil_stopImpersonatingAccount", [from]);
}

/**
 * Poll the Fawkes status endpoint until a *fresh* `session_request` appears,
 * then call approveRequest(). A fresh request has both the `'session_request'`
 * alias key AND its numeric event-ID key present in pendingRequests — the
 * Fawkes server only deletes the numeric key on approval, so checking for both
 * avoids re-approving stale entries left over from previous tests.
 */
export async function waitAndApproveRequest(
  fawkesClient: {
    getStatus: () => Promise<any>;
    approveRequest: () => Promise<any>;
  },
  maxAttempts = 40,
  intervalMs = 500
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await fawkesClient.getStatus();
    const entries = status.pendingRequests as Array<[string, any]>;

    const sessionEntry = entries.find(([k]) => k === "session_request");
    if (sessionEntry) {
      const reqId = sessionEntry[1]?.id;
      // Verify the numeric-ID entry still exists (stale entries lack this)
      const isLive = entries.some(([k]) => String(k) === String(reqId));
      if (isLive) {
        const result = await fawkesClient.approveRequest();
        return (result?.result as string | undefined) ?? "";
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for Fawkes session_request");
}
