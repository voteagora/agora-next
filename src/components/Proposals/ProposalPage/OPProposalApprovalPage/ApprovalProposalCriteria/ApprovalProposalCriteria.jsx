import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalTimeStatus from "@/components/Proposals/Proposal/ProposalTimeStatus";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";

export default function ApprovalProposalCriteria({ proposal }) {
  const proposalData = proposal.proposalData;
  const proposalResults = proposal.proposalResults;
  const proposalSettings = proposalData.proposalSettings;

  const totalVotingPower =
    BigInt(proposalResults.for) + BigInt(proposalResults.abstain);

  return (
    <VStack className="p-4 pb-2 border-t border-gray-200">
      <HStack
        justifyContent="justify-between"
        className="text-xs font-semibold text-gray-700"
      >
        <div>
          QUORUM{" "}
          <TokenAmountDisplay
            amount={proposal.quorum}
            decimals={18}
            currency="OP"
          />
        </div>
        <ProposalTimeStatus
          proposalStatus={proposal.status}
          proposalEndTime={proposal.end_time}
        />
      </HStack>
      <div className="pt-2 text-xs font-semibold text-gray-700">
        {/* {totalVotingPower.toString()} */}
        {proposalSettings.criteria === "TOP_CHOICES" && (
          <p>
            In this top-choices style approval voting proposal, the top{" "}
            {proposalSettings.maxApprovals} options will be executed. Each voter
            can select up to {proposalSettings.maxApprovals} options to vote
            for. If the quorum is not met, no options will be executed.
          </p>
        )}
        {proposalSettings.criteria === "THRESHOLD" && (
          <p>
            In this threshold-based approval voting proposal, all options
            passing the approval threshold of{" "}
            <TokenAmountDisplay
              amount={proposalSettings.criteriaValue}
              decimals={18}
              currency="OP"
            />{" "}
            votes will be executed in order from most to least popular, until
            the total budget of{" "}
            <TokenAmountDisplay
              amount={proposalSettings.budgetAmount}
              decimals={18}
              currency="OP"
            />{" "}
            runs out. Each voter can select up to{" "}
            {proposalSettings.maxApprovals} options to vote for. If the quorum
            is not met, no options will be executed.
          </p>
        )}
      </div>
    </VStack>
  );
}
