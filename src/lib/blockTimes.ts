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
      return 2;

    case 534352: // Scroll
      return 3;

    case 42161: // Arbitrum one
    case 421614: // Arbitrum sepolia
      return 0.25;

    case 901: // Derive
    case 957: // Derive Testnet
      return 2;

    case 7560: // Cyber Mainnet
    case 111557560: // Cyber Testnet
      return 2;

    case 1: // Eth Mainnet
    case 11155111: // Sepolia Testnet
      return 12;

    case 8453: // Base Mainnet
      return 2;

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
  switch (chainIdToUse) {
    // Optimism
    case 10: {
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

    //   Scroll
    case 534352:
      const blockSeconds = getSecondsPerBlock(chainIdToUse);
      const estScrollSecondsDiff =
        (Number(latestBlock.number) - Number(blockNumber)) * blockSeconds;
      return new Date((latestBlock.timestamp - estScrollSecondsDiff) * 1000);

    // Derive Mainnet
    // Derive Testnet
    case 957: // Testnet
    case 901: {
      const blockSeconds = getSecondsPerBlock(chainIdToUse);
      const estNewDaoSecondsDiff =
        (Number(latestBlock.number) - Number(blockNumber)) * blockSeconds;
      return new Date((latestBlock.timestamp - estNewDaoSecondsDiff) * 1000);
    }

    //   Cyber Mainnet
    //   Cyber Testnet
    case 7560:
    case 111557560: {
      const blockSeconds = getSecondsPerBlock(chainIdToUse);
      const estCyberSecondsDiff =
        (Number(latestBlock.number) - Number(blockNumber)) * blockSeconds;
      return new Date((latestBlock.timestamp - estCyberSecondsDiff) * 1000);
    }

    // Arbitrum one
    // Arbitrum sepolia
    case 42161:
    case 421614: {
      const blockSeconds = getSecondsPerBlock(chainIdToUse);
      const estArbitrumSecondsDiff =
        (Number(latestBlock.number) - Number(blockNumber)) * blockSeconds;
      return new Date((latestBlock.timestamp - estArbitrumSecondsDiff) * 1000);
    }

    //   Ethereum Mainnet
    //   Ethereum Sepolia
    case 1:
    case 11155111: {
      const blockSeconds = getSecondsPerBlock(chainIdToUse);
      const estEthSecondsDiff =
        (Number(latestBlock.number) - Number(blockNumber)) * blockSeconds;
      return new Date((latestBlock.timestamp - estEthSecondsDiff) * 1000);
    }

    default:
      return new Date();
  }
}
