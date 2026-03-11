import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import {
  getProposalCurrentQuorum,
  isProposalCreatedBeforeUpgradeCheck,
} from "@/lib/proposalUtils";
import { QuorumTooltip } from "../../OPProposalPage/ProposalVotesSummaryDetails/ProposalVotesSummaryDetails";

export default function ApprovalProposalCriteria({ proposal }) {
  const proposalData = proposal.proposalData;
  const currentQuorum = getProposalCurrentQuorum(proposal.proposalResults);
  const proposalSettings = proposalData.proposalSettings;
  const isProposalCreatedBeforeUpgrade =
    isProposalCreatedBeforeUpgradeCheck(proposal);
  const source = proposal.archiveMetadata?.source;

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
              amount={proposal.quorum || "0"}
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
          proposalStatus={proposal.status}
          proposalEndTime={proposal.endTime}
          proposalStartTime={proposal.startTime}
          proposalCancelledTime={proposal.cancelledTime}
          proposalExecutedTime={proposal.executedTime}
          cancelledTransactionHash={proposal.cancelledTransactionHash}
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
            {source === "eas-oodao" ? (
              <>{proposalSettings.criteriaValue} </>
            ) : (
              <TokenAmountDecorated amount={proposalSettings.criteriaValue} />
            )}{" "}
            votes will be executed in order from most to least popular,
            {source === "eas-oodao" ? (
              <>
                {proposalSettings.budgetAmount > 0 && (
                  <>
                    {" "}
                    until the total budget of {
                      proposalSettings.budgetAmount
                    }{" "}
                    runs out.
                  </>
                )}
              </>
            ) : (
              <>
                until the total budget of{" "}
                <TokenAmountDecorated amount={proposalSettings.budgetAmount} />{" "}
                runs out.
              </>
            )}{" "}
            Voters can select up to {proposalSettings.maxApprovals} options. If
            the quorum is not met, no options will be executed.
          </p>
        )}
      </div>
    </VStack>
  );
}
