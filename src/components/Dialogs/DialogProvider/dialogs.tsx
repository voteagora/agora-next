import { DialogDefinitions } from "./types";
import { DelegateDialog } from "../DelegateDialog/DelegateDialog";
import { CastProposalDialog } from "@/components/Proposals/ProposalCreation/CastProposalDialog";
import {
  CastVoteDialog,
  SupportTextProps,
} from "@/components/Proposals/ProposalPage/CastVoteDialog/CastVoteDialog";

export type DialogType =
  | DelegateDialogType
  | CastProposalDialogType
  | CastVoteDialogType;
// | ApprovalCastVoteDialogType
// | FaqDialogType

export type DelegateDialogType = {
  type: "DELEGATE";
  params: {
    target: string;
    votingPower: string;
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

// export type ApprovalCastVoteDialogType = {
//   type: "APPROVAL_CAST_VOTE";
//   params: {
//     castVoteFragmentRef: ApprovalCastVoteDialogFragment$key;
//     proposalId: string;
//     hasStatement: boolean;
//     votesRepresentedRef: TokenAmountDisplayFragment$key;
//   };
// };

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
  // APPROVAL_CAST_VOTE: ({ ...props }, closeDialog) => {
  //   return <ApprovalCastVoteDialog {...props} closeDialog={closeDialog} />;
  // },
  // FAQ: () => {
  //   return <FaqDialog />;
  // },
};
