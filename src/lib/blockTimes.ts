// Cast for more accurate arithmetic
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";

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

  // Special case for Optimism mainnet due to Bedrock upgrade
  if (chainIdToUse === 10) {
    const blockSeconds = getSecondsPerBlock(chainIdToUse);
    const secondsPerBlockBeforeBedrock = 0.5;
    const bedrockBlockNumber = 105235062;

    const blocksBeforeBedrock = Math.max(
      bedrockBlockNumber - Number(blockNumber),
      0
    );

    const blocksAfterBedrock = Math.min(
      Number(latestBlock.number) - bedrockBlockNumber,
      Number(latestBlock.number) - Number(blockNumber)
    );

    const timeBeforeBedrock =
      blocksBeforeBedrock * secondsPerBlockBeforeBedrock;
    const timeAfterBedrock = blocksAfterBedrock * blockSeconds;

    return new Date(
      (latestBlock.timestamp - timeBeforeBedrock - timeAfterBedrock) * 1000
    );
  }

  // Default calculation for all other chains
  const blockSeconds = getSecondsPerBlock(chainIdToUse);
  const estimatedSecondsDiff =
    (Number(latestBlock.number) - Number(blockNumber)) * blockSeconds;
  return new Date((latestBlock.timestamp - estimatedSecondsDiff) * 1000);
}
