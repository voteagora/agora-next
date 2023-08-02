const secondsPerBlock = BigInt(12);

export function getHumanBlockTime(
  blockNumber,
  latestBlockNumber,
  latestBlockTimestamp
) {
  return new Date(
    Number(
      (BigInt(latestBlockTimestamp) +
        secondsPerBlock * (BigInt(blockNumber) - BigInt(latestBlockNumber))) *
        BigInt(1000)
    )
  );
}
