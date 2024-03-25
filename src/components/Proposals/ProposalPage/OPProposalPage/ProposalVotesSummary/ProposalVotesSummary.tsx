import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./proposalVotesSummary.module.scss";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import Tenant from "@/lib/tenant/tenant";

export default function ProposalVotesSummary({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { token } = Tenant.current();
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
  return (
    <VStack gap={2} className={styles.proposal_votes_summary_container}>
      <HStack justifyContent="justify-between" className="mt-2">
        <div className="gl_votes_for">
          FOR{" "}
          <TokenAmountDisplay
            amount={results.for}
            decimals={token.decimals}
            currency={token.symbol}
          />
        </div>
        <div className="gl_votes_against">
          AGAINST{" "}
          <TokenAmountDisplay
            amount={results.against}
            decimals={token.decimals}
            currency={token.symbol}
          />
        </div>
      </HStack>
      <ProposalVotesBar proposal={proposal} />
      <VStack className="font-medium">
        <HStack justifyContent="justify-between" className="text-gray-4f pb-2">
          <>
            {proposal.quorum && (
              <div>
                Quorum{" "}
                <TokenAmountDisplay
                  amount={proposal.quorum}
                  decimals={token.decimals}
                  currency={token.symbol}
                />
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
        </HStack>
        <ProposalStatusDetail
          proposalEndTime={proposal.end_time}
          proposalStatus={proposal.status}
        />
      </VStack>
    </VStack>
  );
}
