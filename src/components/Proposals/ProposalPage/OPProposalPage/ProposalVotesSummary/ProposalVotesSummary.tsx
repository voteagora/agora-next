import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./proposalVotesSummary.module.scss";
import ProposalTimeStatus from "@/components/Proposals/Proposal/ProposalTimeStatus";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";

export default function ProposalVotesSummary({
  proposal,
}: {
  proposal: Proposal;
}) {
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
  return (
    <VStack gap={2} className={styles.proposal_votes_summary_container}>
      <HStack justifyContent="justify-between" className="mt-2">
        <div className="gl_votes_for">
          FOR{" "}
          <TokenAmountDisplay
            amount={results.for}
            decimals={18}
            currency={"OP"}
          />
        </div>
        <div className="gl_votes_against">
          AGAINST{" "}
          <TokenAmountDisplay
            amount={results.against}
            decimals={18}
            currency={"OP"}
          />
        </div>
      </HStack>
      <ProposalVotesBar proposal={proposal} />
      <HStack justifyContent="justify-between" className="text-gray-4f">
        <div>
          QUORUM{" "}
          <TokenAmountDisplay
            amount={proposal.quorum}
            decimals={18}
            currency={"OP"}
          />
        </div>
        <ProposalTimeStatus
          proposalStatus={proposal.status}
          proposalEndTime={proposal.end_time}
        />
      </HStack>
    </VStack>
  );
}
