"use client";

import Tenant from "@/lib/tenant/tenant";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { PROPOSAL_STATUS, TENANT_NAMESPACES } from "@/lib/constants";
import { AgoraGovExecute } from "@/app/proposals/components/AgoraGovExecute";
import { useAccount } from "wagmi";
import { AgoraGovCancel } from "@/app/proposals/components/AgoraGovCancel";
import { AgoraGovQueue } from "@/app/proposals/components/AgoraGovQueue";
import { BravoGovCancel } from "@/app/proposals/components/BravoGovCancel";
import { TenantNamespace } from "@/lib/types";
import { OZGovQueue } from "@/app/proposals/components/OZGovQueue";
import { OZGovExecute } from "@/app/proposals/components/OZGovExecute";
import { BravoGovExecute } from "@/app/proposals/components/BravoGovExecute";
import { BravoGovQueue } from "@/app/proposals/components/BravoGovQueue";

interface Props {
  proposal: Proposal;
}

export const ProposalStateAdmin = ({ proposal }: Props) => {
  const { ui } = Tenant.current();
  const { isConnected } = useAccount();
  const { namespace } = Tenant.current();

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
        return "This proposal can be executed after the timelock passes.";
    }
  };

  const renderAction = () => {
    switch (proposal.status) {
      case PROPOSAL_STATUS.SUCCEEDED:
        return successActions({ proposal, namespace });

      case PROPOSAL_STATUS.ACTIVE:
      case PROPOSAL_STATUS.PENDING:
        return activeStateActions({ proposal, namespace });

      case PROPOSAL_STATUS.QUEUED:
        return queuedStateActions({ proposal, namespace });

      case PROPOSAL_STATUS.EXECUTED:
        return queuedStateActions({ proposal, namespace });

      default:
        return null;
    }
  };

  const action = renderAction();

  if (action) {
    return (
      <div className="flex flex-row justify-between items-center align-middle border border-line p-2 mb-6 rounded-md bg-neutral text-sm">
        <div className="ml-4">{renderLabel()}</div>
        <div>{action}</div>
      </div>
    );
  }
};

interface ActionProps {
  proposal: Proposal;
  namespace: TenantNamespace;
}

const successActions = ({ proposal, namespace }: ActionProps) => {
  switch (namespace) {
    case TENANT_NAMESPACES.CYBER:
    case TENANT_NAMESPACES.NEW_DAO:
      return (
        <div className="flex flex-row gap-2">
          <AgoraGovCancel proposal={proposal} />
          <AgoraGovQueue proposal={proposal} />
        </div>
      );

    case TENANT_NAMESPACES.UNISWAP:
      return <BravoGovQueue proposal={proposal} />;

    case TENANT_NAMESPACES.ENS:
      return <OZGovQueue proposal={proposal} />;

    default:
      return <AgoraGovQueue proposal={proposal} />;
  }
};

const queuedStateActions = ({ proposal, namespace }: ActionProps) => {
  switch (namespace) {
    case TENANT_NAMESPACES.CYBER:
    case TENANT_NAMESPACES.NEW_DAO:
      return <AgoraGovExecute proposal={proposal} />;

    case TENANT_NAMESPACES.ENS:
      return <OZGovExecute proposal={proposal} />;

    case TENANT_NAMESPACES.UNISWAP:
      return <BravoGovExecute proposal={proposal} />;

    default:
      return <AgoraGovExecute proposal={proposal} />;
  }
};

const activeStateActions = ({ proposal, namespace }: ActionProps) => {
  switch (namespace) {
    case TENANT_NAMESPACES.CYBER:
    case TENANT_NAMESPACES.NEW_DAO:
      return <AgoraGovCancel proposal={proposal} />;

    case TENANT_NAMESPACES.ENS:
      // Cancelling proposals is not supported for ENS
      return null;

    case TENANT_NAMESPACES.UNISWAP:
      return <BravoGovCancel proposal={proposal} />;

    default:
      // Default to Agora governor action
      return <AgoraGovCancel proposal={proposal} />;
  }
};
