import { PublicClient } from "viem";
import Tenant from "@/lib/tenant/tenant";
import { getChainById, getPublicClient } from "@/lib/viem";

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
 * Checks both delegated voting power (getVotes) and token balance (balanceOf)
 * For multi-chain tokens, aggregates balances across all chains
 * Returns the maximum of delegated votes and total token balance
 * Works on both client and server side
 *
 * @param client - Viem public client instance
 * @param address - Wallet address to check voting power for
 * @param config - Tenant configuration with contract details
 * @returns Voting power as bigint (max of delegated votes and total token balance across all chains)
 */
export async function fetchVotingPowerFromContract(
  client: PublicClient,
  address: string,
  config: VotingPowerConfig
): Promise<bigint> {
  try {
    const tenant = Tenant.current();
    const multiChainTokens = tenant.ui.tokens;

    const blockNumber = await client.getBlockNumber();

    // Fetch both voting power and token balance in parallel
    const [votes] = await Promise.all([
      // Get delegated voting power from governor contract
      client
        .readContract({
          abi: config.contracts.token.abi,
          address: config.contracts.token.address as `0x${string}`,
          functionName: "getVotes",
          args: [address],
        })
        .catch((error) => {
          console.error("Failed to fetch voting power (getVotes):", error);
          return BigInt(0);
        }) as Promise<bigint>,
    ]);

    let totalBalance = BigInt(0);

    if (multiChainTokens && multiChainTokens.length > 1) {
      const balancePromises = multiChainTokens.map(async (token) => {
        if (!token.chainId) {
          console.error(`Token ${token.address} is missing chainId`);
          return BigInt(0);
        }

        const chain = getChainById(token.chainId);
        if (!chain) {
          console.error(`Unknown chain ID: ${token.chainId}`);
          return BigInt(0);
        }

        try {
          const chainClient = getPublicClient(chain);

          const balance = await chainClient.readContract({
            abi: config.contracts.token.abi,
            address: token.address as `0x${string}`,
            functionName: "balanceOf",
            args: [address],
          });

          return balance as bigint;
        } catch (error) {
          console.error(
            `Failed to fetch balance for token ${token.address} on ${chain.name}:`,
            error
          );
          return BigInt(0);
        }
      });

      const balances = await Promise.all(balancePromises);
      totalBalance = balances.reduce((sum, bal) => sum + bal, BigInt(0));
    } else {
      const balance = await client
        .readContract({
          abi: config.contracts.token.abi,
          address: config.contracts.token.address as `0x${string}`,
          functionName: "balanceOf",
          args: [address],
        })
        .catch((error) => {
          console.error("Failed to fetch token balance (balanceOf):", error);
          return BigInt(0);
        });
      totalBalance = balance as bigint;
    }

    return (votes as bigint) > totalBalance ? (votes as bigint) : totalBalance;
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
  const fractionalStr = roundedFractional.toString().padStart(maxDecimals, "0");

  return `${wholePart}.${fractionalStr}`;
}
