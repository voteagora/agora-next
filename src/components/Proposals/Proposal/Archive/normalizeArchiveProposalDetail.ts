import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  deriveTimeStatus,
  STATUS_LABEL_MAP,
  toDate,
  safeBigInt,
  safeBigIntOrNull,
  formatArchiveTagLabel,
  deriveProposalTag,
  resolveArchiveThresholds,
} from "./archiveProposalUtils";
import { ARCHIVE_PROPOSAL_DEFAULTS } from "@/app/proposals/data/archiveDefaults";
import { ParsedProposalData, ParsedProposalResults } from "@/lib/proposalUtils";
import {
  ArchiveListProposal,
  DaoNodeVoteTotals,
  EasOodaoVoteOutcome,
  DecodedStandardProposalData,
} from "@/lib/types/archiveProposal";

type NormalizeArchiveProposalOptions = {
  namespace?: string | null;
  tokenDecimals?: number;
};

const getFunctionArgsName = (
  decodedData: ArchiveListProposal["decoded_proposal_data"]
) => {
  if (!decodedData || Array.isArray(decodedData)) {
    return [];
  }

  const { functionArgsName } = decodedData as DecodedStandardProposalData;
  return Array.isArray(functionArgsName) ? functionArgsName : [];
};

const normalizeOption = (proposal: ArchiveListProposal) => {
  // Types guarantee these are arrays or undefined
  if (!proposal.targets?.length) {
    return null;
  }

  return {
    targets: proposal.targets,
    values: proposal.values?.map(String) ?? [],
    signatures: proposal.signatures ?? [],
    calldatas:
      proposal.calldatas?.map((data) =>
        typeof data === "string" && data.startsWith("0x")
          ? (data as `0x${string}`)
          : (`0x${data}` as `0x${string}`)
      ) ?? [],
    functionArgsName: getFunctionArgsName(proposal.decoded_proposal_data),
  };
};

export function isArchiveStandardProposal(proposal: ArchiveListProposal) {
  const moduleName = proposal.voting_module_name;
  return typeof moduleName === "string"
    ? moduleName.toLowerCase() === "standard"
    : true;
}

export function normalizeArchiveStandardProposal(
  proposal: ArchiveListProposal,
  options: NormalizeArchiveProposalOptions = {}
): Proposal {
  const decimals = options.tokenDecimals ?? 18;
  const statusKey = proposal.lifecycle_stage;
  const normalizedStatusKey = STATUS_LABEL_MAP[
    statusKey as keyof typeof STATUS_LABEL_MAP
  ]
    ? statusKey
    : "ACTIVE";

  const timeStatus = deriveTimeStatus(
    proposal,
    normalizedStatusKey as keyof typeof STATUS_LABEL_MAP
  );

  const createdTime =
    toDate(proposal.created_event?.blocktime) ||
    toDate(proposal.blocktime) ||
    timeStatus.proposalStartTime ||
    timeStatus.proposalEndTime ||
    null;
  const startTime = timeStatus.proposalStartTime || createdTime;
  const endTime = timeStatus.proposalEndTime || startTime;
  const queuedTime = toDate(proposal.queue_event?.blocktime) || null;

  const source = proposal.data_eng_properties?.source;
  const voteTotals =
    source === "eas-oodao"
      ? ((proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] ?? {})
      : ((proposal.totals as DaoNodeVoteTotals)?.["no-param"] ?? {});

  const forVotes = safeBigInt(voteTotals["1"]);
  const againstVotes = safeBigInt(voteTotals["0"]);
  const abstainVotes = safeBigInt(voteTotals["2"]);

  const {
    quorum: quorumValue,
    approvalThreshold: approvalThresholdValue,
    votableSupply: votableSupplyValue,
  } = resolveArchiveThresholds(proposal);

  const markdowntitle =
    typeof proposal.title === "string" && proposal.title.trim().length > 0
      ? proposal.title
      : ARCHIVE_PROPOSAL_DEFAULTS.title;

  const description =
    typeof proposal.description === "string" &&
    proposal.description.trim().length > 0
      ? proposal.description
      : ARCHIVE_PROPOSAL_DEFAULTS.description;

  const option = normalizeOption(proposal);

  const proposalData: ParsedProposalData["STANDARD"]["kind"] & {
    source?: string;
  } = {
    options: option ? [option] : [],
    source: proposal.data_eng_properties?.source,
  };

  const proposalResults = {
    for: forVotes,
    against: againstVotes,
    abstain: abstainVotes,
    decimals,
  } satisfies ParsedProposalResults["STANDARD"]["kind"] & {
    decimals?: number;
  };

  const proposerEns =
    typeof proposal.proposer_ens === "string"
      ? proposal.proposer_ens
      : proposal.proposer_ens?.detail;
  const rawTag = Array.isArray(proposal.tags) ? proposal.tags[0] : undefined;

  const proposalTypeData =
    typeof proposal.proposal_type === "object" && proposal.proposal_type
      ? {
          proposal_type_id: Number(proposal.proposal_type.eas_uid || 0),
          name: proposal.proposal_type.name || "Standard",
          quorum: safeBigInt(proposal.proposal_type.quorum || 0),
          approval_threshold: safeBigInt(
            proposal.proposal_type.approval_threshold || 0
          ),
        }
      : null;

  const normalizedProposal: Proposal = {
    id: String(proposal.id),
    proposer:
      typeof proposal.proposer === "string"
        ? proposal.proposer.toLowerCase()
        : "",
    snapshotBlockNumber: Number(
      proposal.start_block ?? proposal.block_number ?? 0
    ),
    createdTime,
    startTime,
    startBlock: safeBigIntOrNull(proposal.start_block),
    endTime,
    endBlock: safeBigIntOrNull(proposal.end_block),
    cancelledTime:
      timeStatus.proposalCancelledTime ||
      toDate(proposal.delete_event?.attestation_time) ||
      null,
    executedTime:
      timeStatus.proposalExecutedTime ||
      toDate(proposal.execute_event?.blocktime) ||
      null,
    executedBlock: safeBigIntOrNull(proposal.execute_event?.block_number),
    queuedTime,
    markdowntitle,
    description,
    quorum: quorumValue,
    votableSupply: votableSupplyValue,
    approvalThreshold: approvalThresholdValue,
    proposalData,
    unformattedProposalData: proposal.proposal_data
      ? proposal.proposal_data.startsWith("0x")
        ? (proposal.proposal_data as `0x${string}`)
        : (`0x${proposal.proposal_data}` as `0x${string}`)
      : null,
    proposalResults,
    proposalType: "STANDARD",
    proposalTypeData,
    status: normalizedStatusKey as Proposal["status"],
    createdTransactionHash: null,
    cancelledTransactionHash: proposal.cancel_event?.transaction_hash ?? null,
    executedTransactionHash: proposal.execute_event?.transaction_hash ?? null,
    offchainProposalId: undefined,
    proposalTypeApproval: proposal.proposal_type_approval,
  };

  const archiveMetadata = {
    source,
    rawTag,
    proposalTypeName:
      typeof proposal.proposal_type === "object"
        ? proposal.proposal_type?.name
        : "Standard",
    proposalTypeTag: deriveProposalTag(proposal),
    proposerEns,
    rawProposalType: proposal.proposal_type,
    defaultProposalTypeRanges: proposal.default_proposal_type_ranges,
  };

  return {
    ...normalizedProposal,
    archiveMetadata,
  } as Proposal & { archiveMetadata: typeof archiveMetadata };
}
