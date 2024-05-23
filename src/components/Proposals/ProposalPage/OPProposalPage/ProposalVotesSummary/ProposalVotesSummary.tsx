import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./proposalVotesSummary.module.scss";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import { Vote } from "@/app/api/common/votes/vote";

export default function ProposalVotesSummary({
  proposal,
  proposalVotes,
}: {
  proposal: Proposal;
  proposalVotes: Vote[];
}) {
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

  return (
    <VStack gap={1} className={styles.proposal_votes_summary_container}>
      <HStack justifyContent="justify-between" className="mt-2">
        <div className="gl_votes_for text-xs font-semibold">
          For <TokenAmountDisplay amount={results.for} />
        </div>
        <HStack gap={2}>
          {Number(results.abstain) > 0 && (
            <div className="gl_votes_abstain text-xs font-semibold">
              Abstain <TokenAmountDisplay amount={results.abstain} />
            </div>
          )}

          <div className="gl_votes_against text-xs font-semibold">
            Against <TokenAmountDisplay amount={results.against} />
          </div>
        </HStack>
      </HStack>
      <ProposalVotesBar proposalVotes={proposalVotes} proposal={proposal} />
      <VStack className="font-medium">
        <HStack
          justifyContent="justify-between"
          className="text-gray-4f pb-2 pt-0"
        >
          <>
            {proposal.quorum && (
              <div className="text-xs">
                Quorum <TokenAmountDisplay amount={proposal.quorum} />
              </div>
            )}
          </>
          <>
            {proposal.quorum && (
              <div className="text-xs">
                <p>{`Threshold ${
                  Number(proposal.approvalThreshold) / 100
                }%`}</p>
              </div>
            )}
          </>
        </HStack>
        <ProposalStatusDetail
          proposalStartTime={proposal.start_time}
          proposalEndTime={proposal.end_time}
          proposalStatus={proposal.status}
          proposalCancelledTime={proposal.cancelled_time}
          cancelledTransactionHash={proposal.cancelled_transaction_hash}
        />
      </VStack>
    </VStack>
  );
}
