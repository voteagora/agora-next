import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import Tenant from "@/lib/tenant/tenant";

export default function ApprovalProposalCriteria({ proposal }) {
  const { token } = Tenant.current();
  const proposalData = proposal.proposalData;
  const proposalResults = proposal.proposalResults;
  const proposalSettings = proposalData.proposalSettings;

  return (
    <VStack className="p-4 pb-2 border-t border-gray-200">
      <div className="px-4 border border-gray-300 rounded-md">
        <HStack
          justifyContent="justify-between"
          className="text-xs font-semibold text-gray-700 py-2"
        >
          <div>
            Quorum{" "}
            <TokenAmountDisplay
              amount={proposal.quorum}
              decimals={token.decimals}
              currency={token.symbol}
            />
          </div>
          <div>
            Current{" "}
            <TokenAmountDisplay
              amount={proposalResults.for}
              decimals={token.decimals}
              currency={token.symbol}
            />
          </div>
        </HStack>
        <ProposalStatusDetail
          proposalStatus={proposal.status}
          proposalEndTime={proposal.end_time}
        />
      </div>
      <div className="pt-2 text-xs font-semibold text-gray-700">
        {/* {totalVotingPower.toString()} */}
        {proposalSettings.criteria === "TOP_CHOICES" && (
          <p>
            In this top-choices style proposal, the top{" "}
            {proposalSettings.maxApprovals} options will be executed. Voters can
            select up to {proposalSettings.maxApprovals} options. If the quorum
            is not met, no options will be executed.
          </p>
        )}
        {proposalSettings.criteria === "THRESHOLD" && (
          <p>
            In this threshold-based proposal, all options passing the approval
            threshold of{" "}
            <TokenAmountDisplay
              amount={proposalSettings.criteriaValue}
              decimals={token.decimals}
              currency={token.symbol}
            />{" "}
            votes will be executed in order from most to least popular, until
            the total budget of{" "}
            <TokenAmountDisplay
              amount={proposalSettings.budgetAmount}
              decimals={token.decimals}
              currency={token.symbol}
            />{" "}
            runs out. Voters can select up to {proposalSettings.maxApprovals}{" "}
            options. If the quorum is not met, no options will be executed.
          </p>
        )}
      </div>
    </VStack>
  );
}
