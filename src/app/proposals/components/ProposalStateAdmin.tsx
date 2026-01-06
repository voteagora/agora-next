"use client";

import Tenant from "@/lib/tenant/tenant";
import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  GOVERNOR_TYPE,
  PROPOSAL_STATUS,
  TENANT_NAMESPACES,
} from "@/lib/constants";
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
import { OffchainCancel } from "@/app/proposals/components/OffchainCancel";
import { PLMConfig } from "../draft/types";

interface Props {
  proposal: Proposal;
}

export const ProposalStateAdmin = ({ proposal }: Props) => {
  const { ui, contracts } = Tenant.current();
  const governorType = contracts.governorType;
  const isBravoGovernor = governorType === GOVERNOR_TYPE.BRAVO;
  const { isConnected, address } = useAccount();
  const { namespace } = Tenant.current();

  const plmConfig = ui.toggle("proposal-lifecycle")?.config as PLMConfig;
  const offchainProposalCreator = plmConfig?.offchainProposalCreator;

  const hasProposalLifecycle = Boolean(ui.toggle("proposal-execute")?.enabled);

  // Only check admin for active proposals for Agora and Bravo governors.
  // This check is used to hide the entire admin bar, not just the Cancel button.
  const isCancellable =
    (proposal.status === PROPOSAL_STATUS.ACTIVE ||
      proposal.status === PROPOSAL_STATUS.QUEUED) &&
    (namespace === TENANT_NAMESPACES.CYBER ||
      namespace === TENANT_NAMESPACES.XAI ||
      namespace === TENANT_NAMESPACES.DEMO ||
      namespace === TENANT_NAMESPACES.SCROLL ||
      namespace === TENANT_NAMESPACES.OPTIMISM ||
      namespace === TENANT_NAMESPACES.DERIVE ||
      namespace === TENANT_NAMESPACES.UNISWAP ||
      namespace === TENANT_NAMESPACES.LINEA ||
      namespace === TENANT_NAMESPACES.B3 ||
      namespace === TENANT_NAMESPACES.PGUILD);

  const { data: adminAddress } = useGovernorAdmin({ enabled: isCancellable });

  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase() ||
    (proposal.proposalType?.startsWith("OFFCHAIN") &&
      address &&
      offchainProposalCreator?.some(
        (creator) => creator.toLowerCase() === address?.toLowerCase()
      ));

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
        if (proposal.proposalType?.startsWith("OFFCHAIN")) {
          return "This proposal can still be cancelled by the creator.";
        }
        return isBravoGovernor
          ? "This proposal can still be cancelled by the proposer."
          : "This proposal can still be cancelled by the admin.";
      case PROPOSAL_STATUS.SUCCEEDED:
        if (namespace === TENANT_NAMESPACES.OPTIMISM) {
          if (
            proposal.proposalType === "APPROVAL" ||
            proposal.proposalType === "STANDARD"
          ) {
            return "This proposal is now passed and can be queued for execution.";
          } else if (
            proposal.proposalType === "OPTIMISTIC" ||
            proposal.proposalType?.startsWith("OFFCHAIN")
          ) {
            // No banner for Optimistic proposals.
            return null;
          }
          if (proposal.proposalType?.startsWith("OFFCHAIN")) {
            return "This proposal can still be cancelled by the creator.";
          }
          return "This proposal can still be cancelled by the admin.";
        }
        if (proposal.proposalType?.startsWith("OFFCHAIN")) {
          return null;
        }
        // If succeeded but not Optimism, then proceed to queue
        return "This proposal is now passed and can be queued for execution.";

      case PROPOSAL_STATUS.QUEUED:
        return "This proposal can be executed after the timelock passes, or cancelled by the admin.";
      default:
        return null;
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
  if (
    isCancellable &&
    !canCancel &&
    proposal.status !== PROPOSAL_STATUS.QUEUED
  ) {
    return null;
  }

  const action = renderAction();

  if (action && renderLabel()) {
    return (
      <div className="flex flex-row justify-between items-center align-middle border border-line p-2 mb-6 rounded-md bg-neutral text-sm text-primary">
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
    case TENANT_NAMESPACES.XAI:
    case TENANT_NAMESPACES.DEMO:
    case TENANT_NAMESPACES.DERIVE:
    case TENANT_NAMESPACES.LINEA:
    case TENANT_NAMESPACES.B3:
    case TENANT_NAMESPACES.PGUILD:
      return (
        <div className="flex flex-row gap-2">
          {proposal.proposalType?.startsWith("OFFCHAIN") ? (
            <OffchainCancel proposal={proposal} />
          ) : (
            <>
              <AgoraGovCancel proposal={proposal} />
              <AgoraGovQueue proposal={proposal} />
            </>
          )}
        </div>
      );

    case TENANT_NAMESPACES.OPTIMISM:
      // Check if proposal was created after the execution launch date
      const proposalDate = proposal.createdTime
        ? new Date(proposal.createdTime)
        : new Date();
      const executionLaunchDate = new Date("2024-12-01");

      if (proposalDate < executionLaunchDate) {
        return null;
      }

      if (
        proposal.proposalType === "STANDARD" ||
        proposal.proposalType === "APPROVAL"
      ) {
        return (
          <div className="flex flex-row gap-2">
            {proposal.proposalType?.startsWith("OFFCHAIN") ? (
              <OffchainCancel proposal={proposal} />
            ) : (
              <>
                <AgoraOptimismGovCancel proposal={proposal} />
                <AgoraOptimismGovQueue proposal={proposal} />
              </>
            )}
          </div>
        );
      } else if (proposal.proposalType === "OPTIMISTIC") {
        return null;
      } else {
        return proposal.proposalType?.startsWith("OFFCHAIN") ? (
          <OffchainCancel proposal={proposal} />
        ) : (
          <AgoraOptimismGovCancel proposal={proposal} />
        );
      }

    case TENANT_NAMESPACES.UNISWAP:
      return <BravoGovQueue proposal={proposal} />;

    case TENANT_NAMESPACES.ENS:
      return <OZGovQueue proposal={proposal} />;

    default:
      return (
        <>
          <AgoraGovCancel proposal={proposal} />
          <AgoraGovQueue proposal={proposal} />
        </>
      );
  }
};

const queuedStateActions = ({ proposal, namespace }: ActionProps) => {
  switch (namespace) {
    case TENANT_NAMESPACES.SCROLL:
    case TENANT_NAMESPACES.CYBER:
    case TENANT_NAMESPACES.XAI:
    case TENANT_NAMESPACES.DEMO:
    case TENANT_NAMESPACES.DERIVE:
    case TENANT_NAMESPACES.LINEA:
    case TENANT_NAMESPACES.B3:
    case TENANT_NAMESPACES.PGUILD:
      return (
        <div className="flex flex-row gap-2">
          {proposal.proposalType?.startsWith("OFFCHAIN") ? (
            <OffchainCancel proposal={proposal} />
          ) : (
            <>
              <AgoraGovCancel proposal={proposal} />
              <AgoraGovExecute proposal={proposal} />
            </>
          )}
        </div>
      );

    case TENANT_NAMESPACES.OPTIMISM:
      // Check if proposal was created after the execution launch date
      const proposalDate = proposal.createdTime
        ? new Date(proposal.createdTime)
        : new Date();
      const executionLaunchDate = new Date("2024-12-01");

      if (proposalDate < executionLaunchDate) {
        return null;
      }

      return (
        <div className="flex flex-row gap-2">
          {proposal.proposalType?.startsWith("OFFCHAIN") ? (
            <OffchainCancel proposal={proposal} />
          ) : (
            <>
              <AgoraOptimismGovCancel proposal={proposal} />
              <AgoraOptimismGovExecute proposal={proposal} />
            </>
          )}
        </div>
      );

    case TENANT_NAMESPACES.ENS:
      return <OZGovExecute proposal={proposal} />;

    case TENANT_NAMESPACES.UNISWAP:
      return <BravoGovExecute proposal={proposal} />;

    default:
      return (
        <>
          <AgoraGovCancel proposal={proposal} />
          <AgoraGovExecute proposal={proposal} />
        </>
      );
  }
};

const activeStateActions = ({ proposal, namespace }: ActionProps) => {
  switch (namespace) {
    case TENANT_NAMESPACES.SCROLL:
    case TENANT_NAMESPACES.CYBER:
    case TENANT_NAMESPACES.XAI:
    case TENANT_NAMESPACES.DEMO:
    case TENANT_NAMESPACES.DERIVE:
    case TENANT_NAMESPACES.LINEA:
    case TENANT_NAMESPACES.B3:
    case TENANT_NAMESPACES.PGUILD:
      return proposal.proposalType?.startsWith("OFFCHAIN") ? (
        <OffchainCancel proposal={proposal} />
      ) : (
        <AgoraGovCancel proposal={proposal} />
      );

    case TENANT_NAMESPACES.OPTIMISM:
      return proposal.proposalType?.startsWith("OFFCHAIN") ? (
        <OffchainCancel proposal={proposal} />
      ) : (
        <AgoraOptimismGovCancel proposal={proposal} />
      );

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
