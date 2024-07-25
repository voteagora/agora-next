// Cast for more accurate arithmetic
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";

const chainId = Tenant.current().contracts.token.chain.id;

/*
 * @param {number} blockNumber
 * @param {number} latestBlockNumber
 * @param {number} latestBlockTimestamp
 * @returns {Date}
 * @description Converts a block number to a human-readable date
 */
export function getHumanBlockTime(
  blockNumber: number | string | bigint,
  latestBlock: Block
) {
  switch (chainId) {
    // Optimism
    case 10: {
      const secondsPerBlock = 2;
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
      const timeAfterBedrock = blocksAfterBedrock * secondsPerBlock;

      return new Date(
        (latestBlock.timestamp - timeBeforeBedrock - timeAfterBedrock) * 1000
      );
    }

    //   Cyber Mainnet
    //   Cyber Testnet
    case 7560:
    case 111557560: {
      const estCyberSecondsDiff =
        (Number(latestBlock.number) - Number(blockNumber)) * 2; // 2 seconds per block
      return new Date((latestBlock.timestamp - estCyberSecondsDiff) * 1000);
    }

    //   Ethereum Mainnet
    //   Ethereum Sepolia
    case 1:
    case 11155111: {
      const estEthSecondsDiff =
        (Number(latestBlock.number) - Number(blockNumber)) * 12.05; // 12.05 seconds per block
      return new Date((latestBlock.timestamp - estEthSecondsDiff) * 1000);
    }

    default:
      return new Date();
  }
}
