import { PublicClient } from "viem";
import { TENANT_NAMESPACES } from "@/lib/constants";

interface VotingPowerConfig {
  namespace: string;
  contracts: {
    token: {
      abi: any;
      address: string;
    };
    governor: {
      abi: any;
      address: string;
    };
  };
}

/**
 * Fetch voting power directly from the contract
 * Works on both client and server side
 * 
 * @param client - Viem public client instance
 * @param address - Wallet address to check voting power for
 * @param config - Tenant configuration with contract details
 * @returns Voting power as bigint
 */
export async function fetchVotingPowerFromContract(
  client: PublicClient,
  address: string,
  config: VotingPowerConfig
): Promise<bigint> {
  try {
    // Get current block number
    const blockNumber = await client.getBlockNumber();

    let votes: bigint;
    
    // Different contracts use different function names
    if (
      config.namespace === TENANT_NAMESPACES.UNISWAP ||
      config.namespace === TENANT_NAMESPACES.SYNDICATE ||
      config.namespace === TENANT_NAMESPACES.TOWNS
    ) {
      // Token contract with getPriorVotes
      votes = (await client.readContract({
        abi: config.contracts.token.abi,
        address: config.contracts.token.address as `0x${string}`,
        functionName: "getPriorVotes",
        args: [address, blockNumber - BigInt(1)],
      })) as unknown as bigint;
    } else {
      // Governor contract with getVotes
      votes = (await client.readContract({
        abi: config.contracts.governor.abi,
        address: config.contracts.governor.address as `0x${string}`,
        functionName: "getVotes",
        args: [address, blockNumber - BigInt(1)],
      })) as unknown as bigint;
    }

    return votes;
  } catch (error) {
    console.error("Failed to fetch voting power from contract:", error);
    return BigInt(0);
  }
}

/**
 * Convert bigint voting power to number with proper decimals handling
 * 
 * @param votingPower - Voting power as bigint (typically 18 decimals)
 * @param decimals - Token decimals (default 18)
 * @returns Voting power as a number
 */
export function formatVotingPower(
  votingPower: bigint,
  decimals: number = 18
): number {
  // Convert to number by dividing by 10^decimals
  const divisor = BigInt(10 ** decimals);
  return Number(votingPower / divisor);
}

/**
 * Format voting power as a string for display
 * 
 * @param votingPower - Voting power as bigint
 * @param decimals - Token decimals (default 18)
 * @param maxDecimals - Maximum decimal places to show (default 2)
 * @returns Formatted string
 */
export function formatVotingPowerString(
  votingPower: bigint,
  decimals: number = 18,
  maxDecimals: number = 2
): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = votingPower / divisor;
  const fractionalPart = votingPower % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalDivisor = BigInt(10 ** (decimals - maxDecimals));
  const roundedFractional = fractionalPart / fractionalDivisor;
  const fractionalStr = roundedFractional.toString().padStart(maxDecimals, '0');
  
  return `${wholePart}.${fractionalStr}`;
}
