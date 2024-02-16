// Cast for more accurate arithmetic
const secondsPerBlock = 2;
const secondsPerBlockBeforeBedrock = 0.5;
const bedrockBlockNumber = 105235062;

/*
 * @param {number} blockNumber
 * @param {number} latestBlockNumber
 * @param {number} latestBlockTimestamp
 * @returns {Date}
 * @description Converts a block number to a human readable date
 */
export function getHumanBlockTime(
  blockNumber: number | string | bigint,
  latestBlockNumber: number | string | bigint
) {
  const timeBeforeBedrock =
    Math.max(bedrockBlockNumber - Number(blockNumber), 0) *
    secondsPerBlockBeforeBedrock;
  const timeAfterBedrock =
    Math.min(
      Number(latestBlockNumber) - Number(blockNumber),
      Number(latestBlockNumber) - bedrockBlockNumber
    ) * secondsPerBlock;

  const timestamp = new Date(
    (Date.now() / 1000 - timeBeforeBedrock - timeAfterBedrock) * 1000
  );

  return timestamp;
}
