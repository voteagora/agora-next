import { getPublicClient } from "@/lib/viem";
import { cache } from "react";
import { formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const SPONSOR_PRIVATE_KEY = process.env.NEXT_PUBLIC_GAS_SPONSOR_PK;
const GAS_COST = 0.001108297;

async function getRelayStatus() {
  if (!SPONSOR_PRIVATE_KEY) {
    throw new Error("SPONSOR_PRIVATE_KEY is not set");
  }
  const publicClient = getPublicClient();
  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);

  const balance = await publicClient.getBalance({
    address: account.address,
  });

  return {
    balance: Number(formatEther(balance)),
    remaining_votes: Math.floor(Number(formatEther(balance)) / GAS_COST),
  };
}

export const apiFetchRelayStatus = cache(getRelayStatus);
