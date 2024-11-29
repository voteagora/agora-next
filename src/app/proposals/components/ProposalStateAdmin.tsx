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
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";
import { AgoraOptimismGovCancel } from "@/app/proposals/components/AgoraOptimismGovCancel";
import { AgoraOptimismGovQueue } from "@/app/proposals/components/AgoraOptimismGovQueue";
import { AgoraOptimismGovExecute } from "@/app/proposals/components/AgoraOptimismGovExecute";

interface Props {
  proposal: Proposal;
}

export const ProposalStateAdmin = ({ proposal }: Props) => {
  const { ui } = Tenant.current();
  const { isConnected, address } = useAccount();
  const { namespace } = Tenant.current();

  const hasProposalLifecycle = Boolean(ui.toggle("proposal-execute")?.enabled);

  // Only check admin for active proposals for Agora and Bravo governors.
  // This check is used to hide the entire admin bar, not just the Cancel button.
  const isCancellable =
    proposal.status === PROPOSAL_STATUS.ACTIVE &&
    (namespace === TENANT_NAMESPACES.CYBER ||
      namespace === TENANT_NAMESPACES.SCROLL ||
      namespace === TENANT_NAMESPACES.OPTIMISM ||
      namespace === TENANT_NAMESPACES.UNISWAP);

  const { data: adminAddress } = useGovernorAdmin({ enabled: isCancellable });

  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();

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
        return "This proposal can still be cancelled by the admin.";
      case PROPOSAL_STATUS.SUCCEEDED:
        if (namespace === TENANT_NAMESPACES.OPTIMISM) {
          if (
            proposal.proposalType === "APPROVAL" ||
            proposal.proposalType === "STANDARD"
          ) {
            return "This proposal is now passed and can be queued for execution.";
          }
          return "This proposal can still be cancelled by the admin.";
        }

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

  // For the active state, where only the admin can cancel proposals,
  // we shouldn't display the admin bar at all.
  if (isCancellable && !canCancel) {
    return null;
  }

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
    case TENANT_NAMESPACES.SCROLL:
    case TENANT_NAMESPACES.CYBER:
      return (
        <div className="flex flex-row gap-2">
          <AgoraGovCancel proposal={proposal} />
          <AgoraGovQueue proposal={proposal} />
        </div>
      );

    case TENANT_NAMESPACES.OPTIMISM:
      if (
        proposal.proposalType === "STANDARD" ||
        proposal.proposalType === "APPROVAL"
      ) {
        return (
          <div className="flex flex-row gap-2">
            <AgoraOptimismGovCancel proposal={proposal} />
            <AgoraOptimismGovQueue proposal={proposal} />
          </div>
        );
      } else {
        return <AgoraOptimismGovCancel proposal={proposal} />;
      }

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
    case TENANT_NAMESPACES.SCROLL:
    case TENANT_NAMESPACES.CYBER:
      return <AgoraGovExecute proposal={proposal} />;

    case TENANT_NAMESPACES.OPTIMISM:
      return <AgoraOptimismGovExecute proposal={proposal} />;

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
    case TENANT_NAMESPACES.SCROLL:
    case TENANT_NAMESPACES.CYBER:
      return <AgoraGovCancel proposal={proposal} />;

    case TENANT_NAMESPACES.OPTIMISM:
      return <AgoraOptimismGovCancel proposal={proposal} />;

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
