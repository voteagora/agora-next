import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { convertToNumber } from "../converters";
import { extractThresholds, resolveArchiveThresholds } from "../thresholds";
import {
  isDaoNodeSource,
  isEasAtlasSource,
  isEasOodaoSource,
  isHybridProposal,
} from "../extractors/guards";
import {
  CITIZEN_TYPES,
  HYBRID_VOTE_WEIGHTS,
  OFFCHAIN_THRESHOLDS,
} from "@/lib/constants";

type CitizenOutcome = Record<string, Record<string, number | string>>;

/**
 * Aggregate citizen votes from eas-atlas outcome structure
 */
function aggregateCitizenVotes(outcome: CitizenOutcome | undefined): {
  for: number;
  against: number;
  abstain: number;
} {
  let forVotes = 0;
  let againstVotes = 0;
  let abstainVotes = 0;

  for (const type of CITIZEN_TYPES) {
    const typeData = outcome?.[type];
    if (typeData) {
      forVotes += Number(typeData["1"] ?? 0);
      againstVotes += Number(typeData["0"] ?? 0);
      abstainVotes += Number(typeData["2"] ?? 0);
    }
  }

  return { for: forVotes, against: againstVotes, abstain: abstainVotes };
}

/**
 * Calculate weighted percentage for hybrid voting
 */
function calcWeightedPercentage(
  delegateVotes: number,
  eligibleDelegates: number,
  citizenVotes: { user: number; app: number; chain: number }
): number {
  const delegatePct =
    eligibleDelegates > 0 ? (delegateVotes / eligibleDelegates) * 100 : 0;
  const userPct = (citizenVotes.user / OFFCHAIN_THRESHOLDS.USER) * 100;
  const appPct = (citizenVotes.app / OFFCHAIN_THRESHOLDS.APP) * 100;
  const chainPct = (citizenVotes.chain / OFFCHAIN_THRESHOLDS.CHAIN) * 100;

  return (
    delegatePct * HYBRID_VOTE_WEIGHTS.delegates +
    userPct * HYBRID_VOTE_WEIGHTS.users +
    appPct * HYBRID_VOTE_WEIGHTS.apps +
    chainPct * HYBRID_VOTE_WEIGHTS.chains
  );
}

/**
 * Derive status for STANDARD proposal types
 */
export const deriveStandardStatus = (
  proposal: ArchiveListProposal,
  proposalType: string,
  decimals: number
): string => {
  const isHybrid =
    proposalType === "HYBRID_STANDARD" || isHybridProposal(proposal);
  const isOffchain =
    proposalType === "OFFCHAIN_STANDARD" || isEasAtlasSource(proposal);

  let forVotes = 0;
  let againstVotes = 0;
  let abstainVotes = 0;
  let totalVotingPower: string | undefined;
  let calculationOptions = 0;

  if (isHybrid) {
    // HYBRID_STANDARD: Weighted combination of delegate + citizen votes
    const delegateTotals = proposal.totals?.["no-param"] || {};
    const delegateFor = convertToNumber(
      String(delegateTotals["1"] ?? "0"),
      decimals
    );
    const delegateAgainst = convertToNumber(
      String(delegateTotals["0"] ?? "0"),
      decimals
    );
    const delegateAbstain = convertToNumber(
      String(delegateTotals["2"] ?? "0"),
      decimals
    );

    const govlessOutcome = (proposal.govless_proposal?.outcome ??
      {}) as CitizenOutcome;
    totalVotingPower = proposal.total_voting_power_at_start;
    const eligibleDelegates = totalVotingPower
      ? convertToNumber(String(totalVotingPower), decimals)
      : 1;

    // Calculate weighted percentages
    forVotes = calcWeightedPercentage(delegateFor, eligibleDelegates, {
      user: Number(govlessOutcome?.USER?.["1"] ?? 0),
      app: Number(govlessOutcome?.APP?.["1"] ?? 0),
      chain: Number(govlessOutcome?.CHAIN?.["1"] ?? 0),
    });
    againstVotes = calcWeightedPercentage(delegateAgainst, eligibleDelegates, {
      user: Number(govlessOutcome?.USER?.["0"] ?? 0),
      app: Number(govlessOutcome?.APP?.["0"] ?? 0),
      chain: Number(govlessOutcome?.CHAIN?.["0"] ?? 0),
    });
    abstainVotes = calcWeightedPercentage(delegateAbstain, eligibleDelegates, {
      user: Number(govlessOutcome?.USER?.["2"] ?? 0),
      app: Number(govlessOutcome?.APP?.["2"] ?? 0),
      chain: Number(govlessOutcome?.CHAIN?.["2"] ?? 0),
    });
  } else if (isOffchain) {
    // OFFCHAIN_STANDARD: Aggregate citizen votes from eas-atlas
    const outcome = proposal.outcome as CitizenOutcome | undefined;
    const aggregated = aggregateCitizenVotes(outcome);
    forVotes = aggregated.for;
    againstVotes = aggregated.against;
    abstainVotes = aggregated.abstain;
    calculationOptions = proposal.calculationOptions ?? 0;
  } else if (isEasOodaoSource(proposal)) {
    // eas-oodao: token-holders outcome
    const outcome = proposal.outcome as
      | { "token-holders"?: Record<string, string> }
      | undefined;
    const voteTotals = outcome?.["token-holders"] || {};
    forVotes = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
    againstVotes = convertToNumber(String(voteTotals["0"] ?? "0"), decimals);
    abstainVotes = convertToNumber(String(voteTotals["2"] ?? "0"), decimals);
    totalVotingPower = proposal.total_voting_power_at_start;
  } else if (isDaoNodeSource(proposal)) {
    // dao_node: standard onchain votes
    const voteTotals = proposal.totals?.["no-param"] || {};
    forVotes = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
    againstVotes = convertToNumber(String(voteTotals["0"] ?? "0"), decimals);
    abstainVotes = convertToNumber(String(voteTotals["2"] ?? "0"), decimals);
    totalVotingPower = proposal.total_voting_power_at_start;
  }

  const thresholds = resolveArchiveThresholds(proposal);

  // Calculate vote threshold percentage (for / (for + against))
  const thresholdVotes = forVotes + againstVotes;
  const voteThresholdPercent =
    thresholdVotes > 0 ? (forVotes / thresholdVotes) * 100 : 0;

  // Check approval threshold
  const hasMetThreshold =
    voteThresholdPercent >= Number(thresholds.approvalThreshold) / 100 ||
    Number(thresholds.approvalThreshold) === 0;

  // Calculate quorum based on calculationOptions
  // calculationOptions=1 means for only, otherwise for+abstain
  const quorumVotes =
    calculationOptions === 1 ? forVotes : forVotes + abstainVotes;

  // Check quorum
  let quorumMet = true;
  if (totalVotingPower && !isHybrid) {
    quorumMet =
      quorumVotes >= convertToNumber(String(thresholds.quorum), decimals);
  }

  // Determine status
  if (!quorumMet || !hasMetThreshold) {
    return "DEFEATED";
  }

  if (forVotes > againstVotes) {
    return "SUCCEEDED";
  }

  if (forVotes < againstVotes) {
    return "DEFEATED";
  }

  return "FAILED";
};
