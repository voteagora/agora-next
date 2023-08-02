import { ethers } from "ethers";

const secondsPerBlock = 12;

export async function getHumanBlockTime(blockNumber) {
  const provider = new ethers.AlchemyProvider(
    "mainnet",
    process.env.NEXT_PUBLIC_ALCHEMY_ID
  );

  let latestBlock = await provider.getBlock("latest");

  return new Date(
    (latestBlock.timestamp +
      secondsPerBlock * (blockNumber - latestBlock.number)) *
      1000
  );
}
