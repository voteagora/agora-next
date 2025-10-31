"use client";
import { useState } from "react";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import {
  isProposalCreatedBeforeUpgradeCheck,
  ParsedProposalResults,
} from "@/lib/proposalUtils";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import ProposalVotesSummaryDetails, {
  QuorumTooltip,
} from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesSummaryDetails/ProposalVotesSummaryDetails";

interface Props {
  proposal: Proposal;
}

type RangeProposalType = {
  min_quorum_pct: number;
  max_quorum_pct: number;
  min_approval_threshold_pct: number;
  max_approval_threshold_pct: number;
};

export default function ProposalVotesSummary({ proposal }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

  const isProposalCreatedBeforeUpgrade =
    isProposalCreatedBeforeUpgradeCheck(proposal);

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

  const hasPendingRanges = (proposal as any).proposalTypeApproval === "PENDING";

  const minApprovalThreshold = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.min_approval_threshold_pct / 100
    : null;
  const maxApprovalThreshold = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.max_approval_threshold_pct / 100
    : null;

  const minQuorum = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.min_quorum_pct / 100
    : null;
  const maxQuorum = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.max_quorum_pct / 100
    : null;

  return (
    <HoverCard
      open={showDetails}
      onOpenChange={setShowDetails}
      openDelay={0}
      closeDelay={0}
    >
      <div style={{ position: "relative" }}>
        <div className="flex flex-col rounded-md font-bold shrink-0 text-xs border border-line mx-4 shadow-newDefault">
          <HoverCardTrigger className="w-full cursor-pointer flex flex-col gap-2 px-4 pt-2">
            <div className="flex flex-row justify-between mt-2">
              <div className="text-positive">
                FOR -{" "}
                <TokenAmountDecorated
                  amount={results.for}
                  hideCurrency
                  specialFormatting
                />
              </div>
              <div className="text-negative">
                AGAINST -{" "}
                <TokenAmountDecorated
                  amount={results.against}
                  hideCurrency
                  specialFormatting
                />
              </div>
            </div>

            <ProposalVotesBar proposal={proposal} />

            <div className="flex flex-col font-medium">
              <div className="flex flex-row text-secondary pb-2 justify-between">
                <>
                  {hasPendingRanges ? (
                    <div>
                      <p>{`Quorum ${minQuorum}% – ${maxQuorum}%`}</p>
                    </div>
                  ) : (
                    proposal.quorum && (
                      <div>
                        Quorum{" "}
                        <TokenAmountDecorated
                          amount={proposal.quorum}
                          hideCurrency
                          specialFormatting
                        />
                        {isProposalCreatedBeforeUpgrade && (
                          <span className="inline-flex items-center">
                            0
                            <QuorumTooltip />
                          </span>
                        )}
                      </div>
                    )
                  )}
                </>
                <>
                  {hasPendingRanges ? (
                    <div>
                      <p>{`Threshold ${minApprovalThreshold}% – ${maxApprovalThreshold}%`}</p>
                    </div>
                  ) : (
                    proposal.approvalThreshold && (
                      <div>
                        <p>{`Threshold ${
                          Number(proposal.approvalThreshold) / 100
                        }%`}</p>
                      </div>
                    )
                  )}
                </>
              </div>
            </div>
          </HoverCardTrigger>

          <div className="px-4 font-medium">
            <ProposalStatusDetail
              proposalStartTime={proposal.startTime}
              proposalEndTime={proposal.endTime}
              proposalStatus={proposal.status}
              proposalCancelledTime={proposal.cancelledTime}
              proposalExecutedTime={proposal.executedTime}
              cancelledTransactionHash={proposal.cancelledTransactionHash}
            />
          </div>
        </div>

        <HoverCardContent
          className="pb-0 absolute w-auto mt-1"
          side="top"
          align={"start"}
        >
          <ProposalVotesSummaryDetails proposal={proposal} />
        </HoverCardContent>
      </div>
    </HoverCard>
  );
}
