// Cast for more accurate arithmetic
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";

const chainId = Tenant.current().contracts.token.chain.id;

/*
 * @param {number} blockNumber
 * @param {number} latestBlockNumber
 * @param {number} latestBlockTimestamp
 * @returns {Date}
 * @description Converts a block number to a human readable date
 */
export function getHumanBlockTime(
  blockNumber: number | string | bigint,
  latestBlock: Block
) {
  switch (chainId) {
    case 10:
      const secondsPerBlock = 2;
      const secondsPerBlockBeforeBedrock = 0.5;
      const bedrockBlockNumber = 105235062;

      const timeBeforeBedrock =
        Math.max(bedrockBlockNumber - Number(blockNumber), 0) *
        secondsPerBlockBeforeBedrock;
      const timeAfterBedrock =
        Math.min(
          Number(latestBlock.number) - Number(blockNumber),
          Number(latestBlock.number) - bedrockBlockNumber
        ) * secondsPerBlock;

      return new Date(
        (Date.now() / 1000 - timeBeforeBedrock - timeAfterBedrock) * 1000
      );

    case 1:
    case 11155111:
      const latestNumber = latestBlock.number;
      const latestTimestamp = latestBlock.timestamp;
      const blockDifference = Number(latestNumber) - Number(blockNumber);
      const estSecondsDifference = blockDifference * 12; // 12 seconds per block

      const estimatedTimestamp = latestTimestamp - estSecondsDifference;
      return new Date(estimatedTimestamp * 1000);

    default:
      return new Date();
  }
}
