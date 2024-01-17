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
import { DelegateChunk } from "@/components/Delegates/DelegateCardList/DelegateCardList";
import { Delegatees } from "@prisma/client";
import { VotingPowerData } from "@/app/api/voting-power/votingPower";
import { MissingVote } from "@/lib/voteUtils";

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
    delegate: DelegateChunk;
    fetchBalanceForDirectDelegation: (
      addressOrENSName: string
    ) => Promise<bigint>;
    fetchDirectDelegatee: (addressOrENSName: string) => Promise<Delegatees>;
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

export type CastVoteDialogProps = {
  proposalId: string;
  reason: string;
  supportType: SupportTextProps["supportType"];
  closeDialog: () => void;
  delegate: any;
  votingPower: VotingPowerData;
  authorityChains: string[][];
  missingVote: MissingVote;
};

export type CastVoteDialogType = {
  type: "CAST_VOTE";
  params: Omit<CastVoteDialogProps, "closeDialog">;
};

export type ApprovalCastVoteDialogProps = {
  proposal: Proposal;
  hasStatement: boolean;
  votingPower: VotingPowerData;
  authorityChains: string[][];
  missingVote: MissingVote;
  closeDialog: () => void;
};

export type ApprovalCastVoteDialogType = {
  type: "APPROVAL_CAST_VOTE";
  params: Omit<ApprovalCastVoteDialogProps, "closeDialog">;
};

export const dialogs: DialogDefinitions<DialogType> = {
  DELEGATE: (
    { delegate, fetchBalanceForDirectDelegation, fetchDirectDelegatee },
    closeDialog
  ) => {
    return (
      <DelegateDialog
        delegate={delegate}
        fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
        completeDelegation={closeDialog}
        fetchDirectDelegatee={fetchDirectDelegatee}
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
    {
      proposalId,
      reason,
      supportType,
      delegate,
      votingPower,
      authorityChains,
      missingVote,
    },
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
        authorityChains={authorityChains}
        missingVote={missingVote}
      />
    );
  },
  APPROVAL_CAST_VOTE: (
    { proposal, hasStatement, votingPower, authorityChains, missingVote },
    closeDialog
  ) => {
    return (
      <ApprovalCastVoteDialog
        proposal={proposal}
        hasStatement={hasStatement}
        closeDialog={closeDialog}
        votingPower={votingPower}
        authorityChains={authorityChains}
        missingVote={missingVote}
      />
    );
  },
  // FAQ: () => {
  //   return <FaqDialog />;
  // },
};
