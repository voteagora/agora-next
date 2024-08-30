"use client";

import Tenant from "@/lib/tenant/tenant";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { PROPOSAL_STATUS } from "@/lib/constants";
import { ProposalExecuteButton } from "@/app/proposals/components/ProposalExecuteButton";
import { useAccount } from "wagmi";
import { ProposalCancelButton } from "@/app/proposals/components/ProposalCancelButton";
import { ProposalQueueButton } from "@/app/proposals/components/ProposalQueueButton";

interface Props {
  proposal: Proposal;
}

export const ProposalStateAdmin = ({ proposal }: Props) => {
  const { isConnected } = useAccount();

  const { ui } = Tenant.current();

  const hasProposalLifecycle = Boolean(ui.toggle("proposal-execute")?.enabled);

  const actionableStates: string[] = [
    PROPOSAL_STATUS.ACTIVE,
    PROPOSAL_STATUS.PENDING,
    PROPOSAL_STATUS.QUEUED,
    PROPOSAL_STATUS.SUCCEEDED,
  ];

  if (
    !isConnected ||
    !hasProposalLifecycle ||
    !proposal.status ||
    !actionableStates.includes(proposal.status)
  ) {
    return null;
  }

  const renderLabel = () => {
    switch (proposal.status) {
      case PROPOSAL_STATUS.ACTIVE:
      case PROPOSAL_STATUS.PENDING:
        return "This proposal still can be cancelled";
      case PROPOSAL_STATUS.SUCCEEDED:
        return "This proposal is now passed and can be queued for execution";
      case PROPOSAL_STATUS.QUEUED:
        return "This proposal can be executed.";
    }
  };

  const renderAction = () => {
    switch (proposal.status) {
      case PROPOSAL_STATUS.SUCCEEDED:
        return (
          <div className="flex flex-row gap-2">
            <ProposalCancelButton proposal={proposal} />
            <ProposalQueueButton proposal={proposal} />
          </div>
        );

      case PROPOSAL_STATUS.ACTIVE:
      case PROPOSAL_STATUS.PENDING:
        return <ProposalCancelButton proposal={proposal} />;

      case PROPOSAL_STATUS.QUEUED:
        return <ProposalExecuteButton proposal={proposal} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row justify-between items-center align-middle border border-line p-2 mb-6 rounded-md bg-neutral text-sm">
      <div className="ml-4">{renderLabel()}</div>
      <div>{renderAction()}</div>
    </div>
  );
};
