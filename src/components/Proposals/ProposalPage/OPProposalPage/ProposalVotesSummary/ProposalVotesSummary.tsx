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
import ProposalVotesSummaryDetails from "../ProposalVotesSummaryDetails/ProposalVotesSummaryDetails";
import { Vote } from "@/app/api/common/votes/vote";

interface Props {
  proposal: Proposal;
  votes: Vote[];
}

export default function ProposalVotesSummary({ proposal, votes }: Props) {
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
        <HoverCardTrigger className="w-full cursor-pointer block">
          <div className="flex flex-col gap-2 pt-2 px-4 rounded-md font-bold shrink-0 text-xs border border-line mx-4 shadow-newDefault">
            <div className="flex flex-row justify-between mt-2">
              <div className="gl_votes_for">
                FOR <TokenAmountDisplay amount={results.for} />
              </div>
              <div className="gl_votes_against">
                AGAINST <TokenAmountDisplay amount={results.against} />
              </div>
            </div>
            <ProposalVotesBar proposal={proposal} votes={votes} />
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
              <ProposalStatusDetail
                proposalStartTime={proposal.start_time}
                proposalEndTime={proposal.end_time}
                proposalStatus={proposal.status}
                proposalCancelledTime={proposal.cancelled_time}
                cancelledTransactionHash={proposal.cancelled_transaction_hash}
              />
            </div>
          </div>

          <HoverCardContent
            className="pb-0 absolute w-auto ml-4 mt-1"
            side="top"
            align={"start"}
          >
            <ProposalVotesSummaryDetails proposal={proposal} votes={votes} />
          </HoverCardContent>
        </HoverCardTrigger>
      </div>
    </HoverCard>
  );
}
