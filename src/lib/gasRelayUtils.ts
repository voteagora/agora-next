import { formatEther } from "viem";

type GasRelayEligibilityParams = {
  /** The tenant's sponsoredVote / sponsoredDelegate toggle is enabled. */
  enabled: boolean;
  /** ETH balance of the sponsor wallet, in wei. */
  sponsorBalance: bigint | undefined;
  /** Minimum sponsor balance in ETH, from UIGasRelayConfig.minBalance. */
  minBalance: string | undefined;
  /** Voter's voting power at the proposal snapshot (raw units). */
  totalVP: string | undefined;
  /** Voter's current token balance (balanceOf). Undefined while loading. */
  tokenBalance: bigint | undefined;
  /** Threshold from UIGasRelayConfig.minVPToUseGasRelay (raw units). */
  minVPToUseGasRelay: string | undefined;
};

/**
 * Decides whether the gas relay can sponsor a vote.
 *
 * A voter qualifies when either their snapshot voting power or their current
 * token balance exceeds the configured threshold. The balance check lets a
 * token holder who received tokens after the proposal snapshot (and so has
 * 0 VP on this proposal) still vote with sponsored gas.
 *
 * Comparisons intentionally keep the historical `Number()` semantics so that
 * existing tenant thresholds behave as they did before.
 */
export function isGasRelayEligible({
  enabled,
  sponsorBalance,
  minBalance,
  totalVP,
  tokenBalance,
  minVPToUseGasRelay,
}: GasRelayEligibilityParams): boolean {
  if (!enabled) {
    return false;
  }

  const sponsorHasFunds =
    Number(formatEther(sponsorBalance ?? 0n)) >= Number(minBalance ?? "0");
  if (!sponsorHasFunds) {
    return false;
  }

  const threshold = Number(minVPToUseGasRelay ?? "0");
  const qualifiesByVP = Number(totalVP ?? "0") > threshold;
  const qualifiesByBalance =
    tokenBalance !== undefined && Number(tokenBalance) > threshold;

  return qualifiesByVP || qualifiesByBalance;
}
