import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalResults } from "@/lib/proposalUtils";

interface Props {
  proposal: Proposal;
  barColor?: string;
}

type RangeProposalType = {
  min_quorum_pct: number;
  max_quorum_pct: number;
  min_approval_threshold_pct: number;
  max_approval_threshold_pct: number;
};

export default function ProposalVotesBar({
  proposal,
  barColor = "wash",
}: Props) {
  const thresholdPercent = Math.round(Number(proposal.approvalThreshold) / 100);

  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
  const totalVotesCount =
    Number(results.for) + Number(results.against) + Number(results.abstain);
  const hasVotes = totalVotesCount > 0;

  // Check if this is an archive proposal with ranges (pending state)
  const archiveMetadata = (
    proposal as unknown as {
      archiveMetadata?: { source?: string; defaultProposalTypeRanges?: any };
    }
  ).archiveMetadata;

  const defaultProposalTypeRanges =
    archiveMetadata?.source === "eas-oodao"
      ? (archiveMetadata.defaultProposalTypeRanges as
          | RangeProposalType
          | undefined)
      : null;

  const minApprovalThreshold = defaultProposalTypeRanges
    ? Math.round(defaultProposalTypeRanges.min_approval_threshold_pct / 100)
    : null;
  const maxApprovalThreshold = defaultProposalTypeRanges
    ? Math.round(defaultProposalTypeRanges.max_approval_threshold_pct / 100)
    : null;

  return (
    <div id="chartContainer" className="relative flex items-stretch gap-x-0.5">
      {hasVotes ? (
        <>
          {Number(results.for) > 0 && (
            <div
              style={{ flex: Number(results.for) / totalVotesCount }}
              className="min-w-[1px] bg-positive h-[10px]"
            ></div>
          )}
          {Number(results.abstain) > 0 && (
            <div
              style={{ flex: Number(results.abstain) / totalVotesCount }}
              className="min-w-[1px] bg-tertiary h-[10px]"
            ></div>
          )}
          {Number(results.against) > 0 && (
            <div
              style={{ flex: Number(results.against) / totalVotesCount }}
              className="min-w-[1px] bg-negative h-[10px]"
            ></div>
          )}
        </>
      ) : (
        <div className={`w-full bg-${barColor} h-[10px]`}></div>
      )}

      {minApprovalThreshold !== null &&
      maxApprovalThreshold !== null &&
      minApprovalThreshold !== maxApprovalThreshold ? (
        <>
          {/* Min threshold marker */}
          <div
            className="bg-primary/60 h-4 w-[2px] absolute -top-[3px] z-50"
            style={{ left: `${minApprovalThreshold}%` }}
          />
          {/* Max threshold marker */}
          <div
            className="bg-primary/60 h-4 w-[2px] absolute -top-[3px] z-50"
            style={{ left: `${maxApprovalThreshold}%` }}
          />
          {/* Range fill between min and max */}
          <div
            className="bg-primary/10 h-[10px] absolute top-0 z-40"
            style={{
              left: `${minApprovalThreshold}%`,
              width: `${maxApprovalThreshold - minApprovalThreshold}%`,
            }}
          />
        </>
      ) : (
        proposal.approvalThreshold && (
          <div
            className="bg-primary h-4 w-[2px] absolute -top-[3px] z-50"
            style={{ left: `${thresholdPercent}%` }}
          />
        )
      )}
    </div>
  );
}
