"use client";
import { useState } from "react";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import ProposalVotesSummaryDetails from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesSummaryDetails/ProposalVotesSummaryDetails";

interface Props {
  proposal: Proposal;
}

export default function ProposalVotesSummary({ proposal }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

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
                FOR <TokenAmountDisplay amount={results.for} />
              </div>
              <div className="text-negative">
                AGAINST <TokenAmountDisplay amount={results.against} />
              </div>
            </div>

            <ProposalVotesBar proposal={proposal} />

            <div className="flex flex-col font-medium">
              <div className="flex flex-row text-secondary pb-2 justify-between">
                <>
                  {proposal.quorum && (
                    <div>
                      Quorum <TokenAmountDisplay amount={proposal.quorum} />
                    </div>
                  )}
                </>
                <>
                  {proposal.approvalThreshold && (
                    <div>
                      <p>{`Threshold ${
                        Number(proposal.approvalThreshold) / 100
                      }%`}</p>
                    </div>
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
