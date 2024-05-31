import styles from "./proposalVotesSummary.module.scss";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";

export default function ProposalVotesSummary({
  proposal,
}: {
  proposal: Proposal;
}) {
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
  return (
    <div
      className={`flex flex-col gap-2 ${styles.proposal_votes_summary_container}`}
    >
      <div className="flex flex-row mt-2 justify-between">
        <div className="gl_votes_for">
          FOR <TokenAmountDisplay amount={results.for} />
        </div>
        <div className="gl_votes_against">
          AGAINST <TokenAmountDisplay amount={results.against} />
        </div>
      </div>
      <ProposalVotesBar proposal={proposal} />
      <div className="flex flex-col font-medium">
        <div className="flex flex-row text-gray-4f pb-2 justify-between">
          <>
            {proposal.quorum && (
              <div>
                Quorum <TokenAmountDisplay amount={proposal.quorum} />
              </div>
            )}
          </>
          <>
            {proposal.quorum && (
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
  );
}
