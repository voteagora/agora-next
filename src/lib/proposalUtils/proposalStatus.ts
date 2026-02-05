import { Proposal, ProposalPayload } from "@/app/api/common/proposals/proposal";
import {
  calculateHybridApprovalProposalMetrics,
  calculateHybridOptimisticProposalMetrics,
  calculateHybridStandardTallies,
  getEndBlock,
  getEndTimestamp,
  getProposalCreatedTime,
  getProposalCurrentQuorum,
  getStartBlock,
  getStartTimestamp,
  isBlockBasedProposal,
  isTimestampBasedProposal,
  ParsedProposalData,
  ParsedProposalResults,
  parseProposalData,
} from "../proposalUtils";
import { ProposalType } from "../types";
import { Block } from "ethers";
import Tenant from "../tenant/tenant";
import { mapArbitrumBlockToMainnetBlock } from "../utils";
import { getHumanBlockTime } from "../blockTimes";

export type ProposalStatus =
  | "CANCELLED"
  | "SUCCEEDED"
  | "DEFEATED"
  | "ACTIVE"
  | "FAILED"
  | "PENDING"
  | "QUEUED"
  | "EXECUTED"
  | "CLOSED"
  | "PASSED";

export async function getProposalStatus(
  proposal: ProposalPayload,
  proposalResults: ParsedProposalResults[ProposalType],
  proposalData: ParsedProposalData[ProposalType],
  latestBlock: Block | null,
  quorum: bigint | null,
  votableSupply: bigint,
  approvalThreshold: bigint | null
): Promise<ProposalStatus> {
  const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;
  const { contracts, ui } = Tenant.current();
  const checkHasNoCalldata = (): boolean => {
    if (
      proposal.proposal_type === "SNAPSHOT" ||
      proposal.proposal_type === "OPTIMISTIC" ||
      proposal.proposal_type.startsWith("OFFCHAIN")
    ) {
      return true;
    }

    if (!proposal.proposal_data) {
      return true;
    }

    const dataAsString =
      typeof proposal.proposal_data === "string"
        ? proposal.proposal_data
        : JSON.stringify(proposal.proposal_data);

    if (dataAsString.trim() === "" || dataAsString.trim() === "{}") {
      return true;
    }

    try {
      const parsedProposalData = parseProposalData(
        dataAsString,
        proposal.proposal_type as ProposalType
      );

      if (parsedProposalData.key === "STANDARD") {
        const options = parsedProposalData.kind.options[0];
        if (!options) return true;
        const noTargets =
          !options.targets ||
          options.targets.length === 0 ||
          options.targets.every(
            (t) =>
              !t ||
              t.trim() === "" ||
              t.toLowerCase() === "0x0000000000000000000000000000000000000000"
          );
        const noCalldatas =
          !options.calldatas ||
          options.calldatas.length === 0 ||
          options.calldatas.every(
            (cd) => !cd || cd.trim() === "" || cd.toLowerCase() === "0x"
          );
        return noTargets || noCalldatas;
      }
      if (parsedProposalData.key === "APPROVAL") {
        if (
          !parsedProposalData.kind.options ||
          parsedProposalData.kind.options.length === 0
        )
          return true;
        return parsedProposalData.kind.options.every((opt) => {
          const noTargets =
            !opt.targets ||
            opt.targets.length === 0 ||
            opt.targets.every(
              (t) =>
                !t ||
                t.trim() === "" ||
                t.toLowerCase() === "0x0000000000000000000000000000000000000000"
            );
          const noCalldatas =
            !opt.calldatas ||
            opt.calldatas.length === 0 ||
            opt.calldatas.every(
              (cd) => !cd || cd.trim() === "" || cd.toLowerCase() === "0x"
            );
          return noTargets || noCalldatas;
        });
      }
    } catch (e) {
      console.error(
        `Error parsing proposal_data in checkHasNoCalldata for proposal ID ${proposal.proposal_id}, type ${proposal.proposal_type}:`,
        e
      );
      return true;
    }
    return true;
  };

  if (proposalResults.key === "SNAPSHOT") {
    return proposalResults.kind.status.toUpperCase() as ProposalStatus;
  }
  if (
    proposal.cancelled_block ||
    (proposalData.kind as ParsedProposalData["OFFCHAIN_STANDARD"]["kind"])
      .cancelled_attestation_hash
  ) {
    return "CANCELLED";
  }
  if (proposal.executed_block) {
    return "EXECUTED";
  }

  if (proposal.queued_block && latestBlock) {
    let queueEventTimeSeconds: number | null = null;
    const isArb =
      contracts.governor.chain.id === 42161 ||
      contracts.governor.chain.id === 421614;
    let blockNumForQueueTime: string | bigint | null = proposal.queued_block;

    if (isArb && proposal.queued_block) {
      const mappedBlock = await mapArbitrumBlockToMainnetBlock(
        BigInt(proposal.queued_block)
      );
      if (mappedBlock) {
        blockNumForQueueTime = mappedBlock;
      } else {
        blockNumForQueueTime = null;
      }
    }

    if (blockNumForQueueTime) {
      const queuedBlockTime = getHumanBlockTime(
        blockNumForQueueTime.toString(),
        latestBlock
      );
      if (queuedBlockTime) {
        queueEventTimeSeconds = Math.floor(queuedBlockTime.getTime() / 1000);
      }
    }

    if (
      queueEventTimeSeconds &&
      latestBlock.timestamp - queueEventTimeSeconds > TEN_DAYS_IN_SECONDS
    ) {
      if (checkHasNoCalldata()) {
        return "PASSED";
      }
    }
    return "QUEUED";
  }

  const isTimeStampBasedTenant = ui.toggle(
    "use-timestamp-for-proposals"
  )?.enabled;

  if (isTimeStampBasedTenant && isTimestampBasedProposal(proposal)) {
    const startTimestamp = getStartTimestamp(proposal);
    const endTimestamp = getEndTimestamp(proposal);

    if (
      !startTimestamp ||
      !latestBlock ||
      Number(startTimestamp) > latestBlock.timestamp
    ) {
      return "PENDING";
    }
    if (!endTimestamp || Number(endTimestamp) > latestBlock.timestamp) {
      return "ACTIVE";
    }
  } else if (isBlockBasedProposal(proposal)) {
    const startBlock = getStartBlock(proposal);
    const endBlock = getEndBlock(proposal);

    if (
      !startBlock ||
      !latestBlock ||
      Number(startBlock) > latestBlock.number
    ) {
      return "PENDING";
    }
    if (!endBlock || Number(endBlock) > latestBlock.number) {
      return "ACTIVE";
    }
  }

  // Ensure we have a return value for all code paths
  switch (proposalResults.key) {
    case "STANDARD":
    case "OFFCHAIN_STANDARD": {
      const {
        for: forVotes,
        against: againstVotes,
        abstain: abstainVotes,
      } = proposalResults.kind;
      const calculationOptions = (
        proposalData as ParsedProposalData["STANDARD" | "HYBRID_STANDARD"]
      ).kind.calculationOptions;
      let thresholdVotes = BigInt(forVotes) + BigInt(againstVotes);
      const voteThresholdPercent =
        Number(thresholdVotes) > 0
          ? (Number(forVotes) / Number(thresholdVotes)) * 100
          : 0;
      const apprThresholdPercent = Number(approvalThreshold) / 100;

      const hasMetThresholdOrNoThreshold =
        Boolean(voteThresholdPercent >= apprThresholdPercent) ||
        approvalThreshold === undefined;

      const quorumForGovernor = getProposalCurrentQuorum(
        proposalResults.kind,
        calculationOptions
      );

      if (
        (quorum && quorumForGovernor < quorum) ||
        forVotes < againstVotes ||
        !hasMetThresholdOrNoThreshold
      ) {
        return "DEFEATED";
      }

      if (forVotes > againstVotes) {
        return "SUCCEEDED";
      }

      return "FAILED";
    }
    case "HYBRID_STANDARD": {
      const tallies = calculateHybridStandardTallies(
        proposalResults.kind,
        Number(quorum!),
        Number(approvalThreshold),
        true, // isHybridStandard,
        (proposalData as ParsedProposalData["HYBRID_STANDARD"]).kind
          .calculationOptions
      );

      if (tallies.quorumMet) {
        return "SUCCEEDED";
      }
      return "DEFEATED";
    }
    case "OPTIMISTIC": {
      const {
        for: forVotes,
        against: againstVotes,
        abstain: abstainVotes,
      } = proposalResults.kind;

      // Check against 50% of votable supply
      if (BigInt(againstVotes) > BigInt(votableSupply!) / 2n) {
        return "DEFEATED";
      } else return "SUCCEEDED";
    }
    case "APPROVAL": {
      const { for: forVotes, abstain: abstainVotes } = proposalResults.kind;
      const proposalQuorumVotes = forVotes + abstainVotes;

      if (quorum && proposalQuorumVotes < quorum) {
        return "DEFEATED";
      }

      if (proposalResults.kind.criteria === "THRESHOLD") {
        for (const option of proposalResults.kind.options) {
          if (option.votes > proposalResults.kind.criteriaValue) {
            return "SUCCEEDED";
          }
        }

        return "DEFEATED";
      } else {
        return "SUCCEEDED";
      }
    }
    case "OFFCHAIN_APPROVAL": {
      // Need to update to take weights
      const { for: forVotes, abstain: abstainVotes } = proposalResults.kind;
      const proposalQuorumVotes = forVotes + abstainVotes;

      if (quorum && proposalQuorumVotes < quorum) {
        return "DEFEATED";
      }

      return "SUCCEEDED";
    }
    case "HYBRID_APPROVAL": {
      const kind = proposalResults.kind;

      const proposalForMetrics = {
        proposalResults: kind,
        quorum: quorum!,
        approvalThreshold: 0,
      };

      const metrics = calculateHybridApprovalProposalMetrics({
        proposalResults: kind,
        proposalData:
          proposalData.kind as ParsedProposalData["HYBRID_APPROVAL"]["kind"],
        quorum: Number(quorum!),
        createdTime: getProposalCreatedTime({
          proposalData,
          latestBlock,
          createdBlock: proposal.created_block,
        }),
      });

      // Check if weighted quorum is met
      if (!metrics.quorumMet) {
        return "DEFEATED";
      }

      if (kind.criteria === "THRESHOLD") {
        return metrics.thresholdMet ? "SUCCEEDED" : "DEFEATED";
      } else {
        return "SUCCEEDED";
      }
    }
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
    case "HYBRID_OPTIMISTIC_TIERED": {
      // Create a temporary proposal object for the metrics calculation
      const tempProposal = {
        proposalResults: proposalResults.kind,
        proposalData: proposalData.kind,
        proposalType: proposal.proposal_type,
        quorum: quorum,
      } as Proposal;

      const metrics = calculateHybridOptimisticProposalMetrics(tempProposal);
      return metrics.vetoThresholdMet ? "DEFEATED" : "SUCCEEDED";
    }
    default: {
      // Default case to handle any unmatched proposalResults.key values
      console.warn(
        `Unhandled proposal type in getProposalStatus: ${(proposalResults as any).key}`
      );
      return "FAILED";
    }
  }
}
