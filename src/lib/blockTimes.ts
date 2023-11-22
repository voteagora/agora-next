// Cast for more accurate arithmetic
const secondsPerBlock = BigInt(2);

/*
 * @param {number} blockNumber
 * @param {number} latestBlockNumber
 * @param {number} latestBlockTimestamp
 * @returns {Date}
 * @description Converts a block number to a human readable date
 */
export function getHumanBlockTime(
  blockNumber: number | string | bigint,
  latestBlockNumber: number | string | bigint,
  latestBlockTimestamp: number | string | bigint
) {
  return new Date(
    Number(
      (BigInt(latestBlockTimestamp) +
        secondsPerBlock * (BigInt(blockNumber) - BigInt(latestBlockNumber))) *
        BigInt(1000)
    )
  );
}
