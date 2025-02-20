import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import { getProposalCurrentQuorum, ProposalStatus } from "@/lib/proposalUtils";

interface ProposalSettings {
  criteria: "TOP_CHOICES" | "THRESHOLD";
  criteriaValue: number;
  maxApprovals: number;
  budgetAmount?: string;
}

export interface ProposalData {
  proposalSettings: ProposalSettings;
}

interface Proposal {
  proposalData: ProposalData;
  proposalResults: any;
  quorum: string;
  status: string;
  endTime: string;
  startTime: string;
  cancelledTime?: string;
  executedTime?: string;
  cancelledTransactionHash?: string;
}

interface ApprovalProposalCriteriaProps {
  proposal: Proposal;
}

export default function ApprovalProposalCriteria({
  proposal,
}: ApprovalProposalCriteriaProps) {
  const proposalData = proposal.proposalData;
  const currentQuorum = getProposalCurrentQuorum(proposal.proposalResults);
  const proposalSettings = proposalData.proposalSettings;

  return (
    <VStack className="p-4 pb-2 border-t border-line">
      <div className="px-4 border border-line rounded-md">
        <HStack
          justifyContent="justify-between"
          className="text-xs font-semibold text-secondary py-2"
        >
          <div>
            Quorum{" "}
            <TokenAmountDecorated
              amount={proposal.quorum}
              hideCurrency
              specialFormatting
            />
          </div>
          <div>
            Current{" "}
            <TokenAmountDecorated
              amount={currentQuorum}
              hideCurrency
              specialFormatting
            />
          </div>
        </HStack>
        <ProposalStatusDetail
          proposalStatus={proposal.status as ProposalStatus}
          proposalEndTime={new Date(proposal.endTime)}
          proposalStartTime={new Date(proposal.startTime)}
          proposalCancelledTime={
            proposal.cancelledTime ? new Date(proposal.cancelledTime) : null
          }
          proposalExecutedTime={
            proposal.executedTime ? new Date(proposal.executedTime) : null
          }
          cancelledTransactionHash={proposal.cancelledTransactionHash ?? null}
        />
      </div>
      <div className="pt-2 text-xs font-semibold text-secondary">
        {/* {totalVotingPower.toString()} */}
        {proposalSettings.criteria === "TOP_CHOICES" && (
          <p>
            In this top-choices style proposal, the top{" "}
            {proposalSettings.criteriaValue} options will be executed. Voters
            can select up to {proposalSettings.maxApprovals} options. If the
            quorum is not met, no options will be executed.
          </p>
        )}
        {proposalSettings.criteria === "THRESHOLD" && (
          <p>
            In this threshold-based proposal, all options passing the approval
            threshold of{" "}
            <TokenAmountDecorated
              amount={proposalSettings.criteriaValue.toString()}
            />{" "}
            votes will be executed in order from most to least popular, until
            the total budget of{" "}
            <TokenAmountDecorated
              amount={proposalSettings.budgetAmount?.toString() ?? "0"}
            />{" "}
            runs out. Voters can select up to {proposalSettings.maxApprovals}{" "}
            options. If the quorum is not met, no options will be executed.
          </p>
        )}
      </div>
    </VStack>
  );
}
