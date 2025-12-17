// Cast for more accurate arithmetic
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";
import { optimism, scroll } from "viem/chains";

const VARIABLE_BLOCK_TIMES = [
  {
    id: optimism.id,
    secondsBeforeUpdate: 0.5,
    updateBlockNumber: 105235062,
  },
  {
    id: scroll.id,
    secondsBeforeUpdate: 1.5,
    updateBlockNumber: 25688713,
  },
];

const { contracts, ui } = Tenant.current();

const chainId = ui.toggle("use-l1-block-number")?.enabled
  ? contracts.chainForTime?.id
  : contracts.token.chain.id;

const forceTokenChainId = contracts.token.chain.id;

export function secondsToBlocks(seconds: number): number {
  return Math.floor(seconds / getSecondsPerBlock(chainId));
}

export function blocksToSeconds(blocks: number): number {
  return blocks * getSecondsPerBlock(chainId);
}

export function getSecondsPerBlock(chainId: number | undefined): number {
  switch (chainId) {
    case 10: // Optimism
    case 11155420: // Optimism sepolia
    case 8453: // Base Mainnet
    case 59144: // Linea Mainnet
    case 59141: // Linea Testnet
    case 901: // Derive
    case 957: // Derive Testnet
    case 7560: // Cyber Mainnet
    case 111557560: // Cyber Testnet
      return 2;

    case 534352: // Scroll
      return 2;

    case 42161: // Arbitrum one
    case 421614: // Arbitrum sepolia
      return 0.25;

    case 1: // Eth Mainnet
    case 11155111: // Sepolia Testnet
      return 12;

    default:
      throw new Error(`Block time for chain:${chainId} not specified`);
  }
}

/*
 * @param {number} blockNumber
 * @param {Block} latestBlock
 * @returns {Date}
 * @description Converts a block number to a human-readable date
 */
export function getHumanBlockTime(
  blockNumber: number | string | bigint,
  latestBlock: Block,
  forceTokenChain: boolean = false
) {
  const chainIdToUse = forceTokenChain ? forceTokenChainId : chainId;

  const update = VARIABLE_BLOCK_TIMES.find((b) => b.id === chainIdToUse);
  // Handle changes in block time production for Optimism and scroll
  if (update) {
    const blockSeconds = getSecondsPerBlock(chainIdToUse);
    const secondsPerBlockBeforeUpdate = update.secondsBeforeUpdate;
    const blockTimeUpdateBlockNumber = update.updateBlockNumber;

    const blocksBeforeUpdate = Math.max(
      blockTimeUpdateBlockNumber - Number(blockNumber),
      0
    );

    const blocksAfterUpdate = Math.min(
      Number(latestBlock.number) - blockTimeUpdateBlockNumber,
      Number(latestBlock.number) - Number(blockNumber)
    );

    const timeBeforeUpdate = blocksBeforeUpdate * secondsPerBlockBeforeUpdate;
    const timeAfterUpdate = blocksAfterUpdate * blockSeconds;

    return new Date(
      (latestBlock.timestamp - timeBeforeUpdate - timeAfterUpdate) * 1000
    );
  }

  // Default calculation for all other chains
  const blockSeconds = getSecondsPerBlock(chainIdToUse);
  const estimatedSecondsDiff =
    (Number(latestBlock.number) - Number(blockNumber)) * blockSeconds;
  return new Date((latestBlock.timestamp - estimatedSecondsDiff) * 1000);
}
