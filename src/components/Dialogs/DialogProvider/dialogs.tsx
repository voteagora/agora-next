import { DialogDefinitions } from "./types";
import { DelegateDialog } from "../DelegateDialog/DelegateDialog";
import { CastProposalDialog } from "@/components/Proposals/ProposalCreation/CastProposalDialog";
import {
  CastVoteDialog,
  SupportTextProps,
} from "@/components/Proposals/ProposalPage/CastVoteDialog/CastVoteDialog";
import { AdvancedDelegateDialog } from "../AdvancedDelegateDialog/AdvancedDelegateDialog";
import { ApprovalCastVoteDialog } from "@/components/Proposals/ProposalPage/ApprovalCastVoteDialog/ApprovalCastVoteDialog";
import { Proposal } from "@/app/api/proposals/proposal";

export type DialogType =
  | DelegateDialogType
  | CastProposalDialogType
  | CastVoteDialogType
  | AdvancedDelegateDialogType
  | ApprovalCastVoteDialogType;
// | FaqDialogType

export type DelegateDialogType = {
  type: "DELEGATE";
  params: {
    target: string;
    votingPower: string;
  };
};

export type AdvancedDelegateDialogType = {
  type: "ADVANCED_DELEGATE";
  params: {
    target: string;
    fetchVotingPowerForSubdelegation: (address: string) => Promise<string>;
    checkIfDelegatingToProxy: (address: string) => Promise<boolean>;
    fetchCurrentDelegatees: (address: string) => Promise<any>;
    getProxyAddress: (address: string) => Promise<string>;
  };
};

export type CastProposalDialogType = {
  type: "CAST_PROPOSAL";
  params: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    txHash?: string;
  };
};

// export type FaqDialogType = {
//   type: "FAQ";
//   params: {};
// };

export type CastVoteDialogType = {
  type: "CAST_VOTE";
  params: {
    proposalId: string;
    reason: string;
    supportType: SupportTextProps["supportType"];
    delegate: any;
    votingPower: string;
  };
};

export type ApprovalCastVoteDialogType = {
  type: "APPROVAL_CAST_VOTE";
  params: {
    proposal: Proposal;
    hasStatement: boolean;
  };
};

export const dialogs: DialogDefinitions<DialogType> = {
  DELEGATE: ({ target, votingPower }, closeDialog) => {
    return (
      <DelegateDialog
        target={target}
        votingPower={votingPower}
        completeDelegation={closeDialog}
      />
    );
  },
  ADVANCED_DELEGATE: (
    {
      target,
      fetchVotingPowerForSubdelegation,
      checkIfDelegatingToProxy,
      fetchCurrentDelegatees,
      getProxyAddress,
    },
    closeDialog
  ) => {
    return (
      <AdvancedDelegateDialog
        target={target}
        fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
        checkIfDelegatingToProxy={checkIfDelegatingToProxy}
        fetchCurrentDelegatees={fetchCurrentDelegatees}
        getProxyAddress={getProxyAddress}
        completeDelegation={closeDialog}
      />
    );
  },
  CAST_PROPOSAL: ({ isError, isLoading, isSuccess, txHash }, closeDialog) => {
    return (
      <CastProposalDialog
        isError={isError}
        isLoading={isLoading}
        isSuccess={isSuccess}
        txHash={txHash}
        closeDialog={closeDialog}
      />
    );
  },
  CAST_VOTE: (
    { proposalId, reason, supportType, delegate, votingPower },
    closeDialog
  ) => {
    return (
      <CastVoteDialog
        proposalId={proposalId}
        reason={reason}
        supportType={supportType}
        closeDialog={closeDialog}
        delegate={delegate}
        votingPower={votingPower}
      />
    );
  },
  APPROVAL_CAST_VOTE: ({ proposal, hasStatement }, closeDialog) => {
    return (
      <ApprovalCastVoteDialog
        proposal={proposal}
        hasStatement={hasStatement}
        closeDialog={closeDialog}
      />
    );
  },
  // FAQ: () => {
  //   return <FaqDialog />;
  // },
};
