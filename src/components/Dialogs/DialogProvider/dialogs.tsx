import { DialogDefinitions } from "./types";
import { DelegateDialog } from "../DelegateDialog/DelegateDialog";
import { UndelegateDialog } from "../UndelegateDialog/UndelegateDialog";
import { SwitchNetwork } from "../SwitchNetworkDialog/SwitchNetworkDialog";
import {
  CastVoteDialog,
  SupportTextProps,
} from "@/components/Proposals/ProposalPage/CastVoteDialog/CastVoteDialog";
import { AdvancedDelegateDialog } from "../AdvancedDelegateDialog/AdvancedDelegateDialog";
import { ApprovalCastVoteDialog } from "@/components/Proposals/ProposalPage/ApprovalCastVoteDialog/ApprovalCastVoteDialog";
import { Proposal } from "@/app/api/common/proposals/proposal";
import RetroPGFShareCardDialog from "@/components/RetroPGF/RetroPGFShareCardDialog";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import { MissingVote } from "@/lib/voteUtils";
import {
  DelegateePayload,
  Delegation,
} from "@/app/api/common/delegations/delegation";
import { Chain } from "viem/chains";
import { DeleteDraftProposalDialog } from "@/app/proposals/draft/components/DeleteDraftButton";
import { DeleteAllDraftProposalsDialog as DeleteAllDraftProposalsDialogComponent } from "@/components/Proposals/DraftProposals/ClearAllDraftsButton";
import CreateDraftProposalDialog from "@/app/proposals/draft/components/dialogs/CreateDraftProposalDialog";
import UpdateDraftProposalDialog from "@/app/proposals/draft/components/dialogs/UpdateDraftProposalDialog";
import SponsorOnchainProposalDialog from "@/app/proposals/draft/components/dialogs/SponsorOnchainProposalDialog";
import SponsorSnapshotProposalDialog from "@/app/proposals/draft/components/dialogs/SponsorSnapshotProposalDialog";
import AddGithubPRDialog from "@/app/proposals/draft/components/dialogs/AddGithubPRDialog";
import { ProposalType, StakedDeposit } from "@/lib/types";
import { fetchAllForAdvancedDelegation } from "@/app/delegates/actions";
import { PartialDelegationDialog } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationDialog";
import { ShareDialog as ShareVoteDialog } from "@/components/Proposals/ProposalPage/ShareVoteDialog/ShareVoteDialog";
import { Vote } from "@/app/api/common/votes/vote";
import { SimulationReportDialog } from "../SimulationReportDialog/SimulationReportDialog";
import { StructuredSimulationReport } from "@/lib/seatbelt/types";
import { EncourageConnectWalletDialog } from "@/components/Delegates/Delegations/EncourageConnectWalletDialog";
import { CreateScopeDialog } from "@/components/Admin/CreateScopeDialog";
import { ScopeData } from "@/lib/types";
import { CreateAccountActionDialog } from "@/components/Admin/CreateAccountActionDialog";
import SponsorOffchainProposalDialog from "@/app/proposals/draft/components/dialogs/SponsorOffchainProposalDialog";
import { DraftProposal } from "@/app/proposals/draft/types";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";
import { ForumPost, ForumTopic } from "@/lib/forumUtils";
import ReportModal from "@/app/duna/components/ReportModal";

export type DialogType =
  | AdvancedDelegateDialogType
  | ApprovalCastVoteDialogType
  | CastVoteDialogType
  | CreateDraftProposalDialog
  | DelegateDialogType
  | DeleteDraftProposalDialog
  | DeleteAllDraftProposalsDialog
  | OpenGithubPRDialog
  | PartialDelegateDialogType
  | RetroPGFShareCardDialog
  | SponsorOnchainDraftProposalDialog
  | SponsorSnapshotDraftProposalDialog
  | SwithcNetworkDialogType
  | UndelegateDialogType
  | UpdateDraftProposalDialog
  | OpenGithubPRDialog
  | ShareVoteDialogType
  | SimulationReportDialogType
  | EncourageConnectWalletDialogType
  | CreateScopeDialogType
  | AccountActionDialogType
  | SponsorOffchainDraftProposalDialog
  | ConfirmDialogType
  | ReportModalDialogType;
// | FaqDialogType

export type DelegateDialogType = {
  type: "DELEGATE";
  params: {
    delegate: DelegateChunk;
    fetchDirectDelegatee: (
      addressOrENSName: string
    ) => Promise<DelegateePayload | null>;
    isDelegationEncouragement?: boolean;
  };
};

export type UndelegateDialogType = {
  type: "UNDELEGATE";
  params: {
    delegate: DelegateChunk;
    fetchBalanceForDirectDelegation: (
      addressOrENSName: string
    ) => Promise<bigint>;
    fetchDirectDelegatee: (
      addressOrENSName: string
    ) => Promise<DelegateePayload | null>;
  };
};

export type AdvancedDelegateDialogType = {
  type: "ADVANCED_DELEGATE";
  params: {
    target: string;
    fetchAllForAdvancedDelegation: typeof fetchAllForAdvancedDelegation;
    isDelegationEncouragement?: boolean;
  };
};

export type PartialDelegateDialogType = {
  type: "PARTIAL_DELEGATE";
  params: {
    delegate: DelegateChunk;
    fetchCurrentDelegatees: (addressOrENSName: string) => Promise<Delegation[]>;
    isDelegationEncouragement?: boolean;
  };
};

export type CastProposalDialogType = {
  type: "CAST_PROPOSAL";
  params: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    txHash?: string;
    isEas?: boolean;
  };
};

export type RetroPGFShareCardDialog = {
  transparent: boolean;
  type: "RETROPGF_SHARE_CARD";
  params: {
    awarded: string;
    displayName: string;
    id: string;
    profileImageUrl: string | null;
  };
};

export type SwithcNetworkDialogType = {
  type: "SWITCH_NETWORK";
  params: {
    chain: Chain;
  };
};

export type StaleDepositAddDialogType = {
  type: "STAKE_DEPOSIT_ADD";
  params: {
    deposit: StakedDeposit;
  };
};

export type StakeDepositWithdrawDialogType = {
  type: "STAKE_DEPOSIT_WITHDRAW";
  params: {
    deposit: StakedDeposit;
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

export type ShareVoteDialogType = {
  type: "SHARE_VOTE";
  params: {
    forPercentage: number;
    againstPercentage: number;
    blockNumber: string | null;
    endsIn: string | null;
    voteDate: string | null;
    supportType: SupportTextProps["supportType"];
    voteReason: string;
    proposalId: string;
    proposalTitle: string;
    proposalType: ProposalType;
    proposal: Proposal;
    newVote: {
      support: string;
      reason: string;
      params: string[];
      weight: string;
    };
    totalOptions: number;
    votes: Vote[] | null;
    options: {
      description: string;
      votes: string;
      votesAmountBN: string;
      totalVotingPower: string;
      proposalSettings: any;
      thresholdPosition: number;
      isApproved: boolean;
    }[];
  };
  className?: string;
};

export type ApprovalCastVoteDialogProps = {
  proposal: Proposal;
  hasStatement: boolean;
  votingPower: VotingPowerData | null;
  authorityChains: string[][] | null;
  missingVote: MissingVote;
  closeDialog: () => void;
};

export type ApprovalCastVoteDialogType = {
  type: "APPROVAL_CAST_VOTE";
  params: Omit<ApprovalCastVoteDialogProps, "closeDialog">;
};

export type DeleteDraftProposalDialog = {
  type: "DELETE_DRAFT_PROPOSAL";
  params: { proposalId: number; onDeleteSuccess?: () => void };
};

export type DeleteAllDraftProposalsDialog = {
  type: "DELETE_ALL_DRAFT_PROPOSALS";
  params: { draftCount: number; onSuccess?: () => void };
};

export type CreateDraftProposalDialog = {
  type: "CREATE_DRAFT_PROPOSAL";
  params: { redirectUrl: string; githubUrl: string };
};

export type UpdateDraftProposalDialog = {
  type: "UPDATE_DRAFT_PROPOSAL";
  params: { redirectUrl: string };
};

export type SponsorSnapshotDraftProposalDialog = {
  type: "SPONSOR_SNAPSHOT_DRAFT_PROPOSAL";
  params: { redirectUrl: string; snapshotLink: string };
};

export type SponsorOnchainDraftProposalDialog = {
  type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL";
  params: {
    redirectUrl: string;
    txHash: `0x${string}`;
    isHybrid: boolean;
    draftProposal: DraftProposal;
  };
};

export type SponsorOffchainDraftProposalDialog = {
  type: "SPONSOR_OFFCHAIN_DRAFT_PROPOSAL";
  params: { redirectUrl: string; txHash: `0x${string}` };
};

export type OpenGithubPRDialog = {
  type: "OPEN_GITHUB_PR";
  params: { redirectUrl: string; githubUrl: string };
};

export type SimulationReportDialogType = {
  type: "SIMULATION_REPORT";
  params: {
    report: StructuredSimulationReport | null;
  };
  className?: string;
};

export type EncourageConnectWalletDialogType = {
  type: "ENCOURAGE_CONNECT_WALLET";
  params: {};
};

export type CreateScopeDialogType = {
  type: "CREATE_SCOPE";
  params: {
    proposalTypeId: number;
    onSuccess: (scope: ScopeData) => void;
  };
  className?: string;
};

export type AccountActionDialogType = {
  type: "ACCOUNT_ACTION";
  params: {};
};

export type ConfirmDialogType = {
  type: "CONFIRM";
  params: {
    title: string;
    message: string;
    onConfirm: () => void;
  };
};

export type ReportModalDialogType = {
  type: "REPORT_MODAL";
  className?: string;
  params: {
    report: ForumTopic | null;
    onDelete?: () => void;
    onArchive?: () => void;
    onCommentAdded?: (newComment: ForumPost) => void;
    onCommentDeleted?: (commentId: number) => void;
    onCommentUpdated?: (commentId: number, updates: Partial<ForumPost>) => void;
  };
};

export const dialogs: DialogDefinitions<DialogType> = {
  DELEGATE: (
    { delegate, fetchDirectDelegatee, isDelegationEncouragement },
    closeDialog
  ) => {
    return (
      <DelegateDialog
        delegate={delegate}
        fetchDirectDelegatee={fetchDirectDelegatee}
        isDelegationEncouragement={isDelegationEncouragement}
      />
    );
  },
  UNDELEGATE: (
    { delegate, fetchBalanceForDirectDelegation, fetchDirectDelegatee },
    closeDialog
  ) => {
    return (
      <UndelegateDialog
        delegate={delegate}
        fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
        fetchDirectDelegatee={fetchDirectDelegatee}
      />
    );
  },
  PARTIAL_DELEGATE: (
    { delegate, fetchCurrentDelegatees, isDelegationEncouragement },
    closeDialog
  ) => {
    return (
      <PartialDelegationDialog
        closeDialog={closeDialog}
        delegate={delegate}
        fetchCurrentDelegatees={fetchCurrentDelegatees}
        isDelegationEncouragement={isDelegationEncouragement}
      />
    );
  },
  ADVANCED_DELEGATE: (
    { target, fetchAllForAdvancedDelegation, isDelegationEncouragement },
    closeDialog
  ) => {
    return (
      <AdvancedDelegateDialog
        target={target}
        fetchAllForAdvancedDelegation={fetchAllForAdvancedDelegation}
        completeDelegation={closeDialog}
        isDelegationEncouragement={isDelegationEncouragement}
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
  SHARE_VOTE: ({
    forPercentage,
    againstPercentage,
    blockNumber,
    endsIn,
    voteDate,
    supportType,
    voteReason,
    proposalId,
    proposalTitle,
    proposalType,
    proposal,
    totalOptions,
    options,
    votes,
    newVote,
  }) => {
    return (
      <ShareVoteDialog
        forPercentage={forPercentage}
        againstPercentage={againstPercentage}
        blockNumber={blockNumber}
        endsIn={endsIn}
        voteDate={voteDate}
        supportType={supportType}
        voteReason={voteReason}
        proposalId={proposalId}
        proposalTitle={proposalTitle}
        proposalType={proposalType}
        proposal={proposal}
        newVote={newVote}
        totalOptions={totalOptions}
        options={options}
        votes={votes}
      />
    );
  },
  RETROPGF_SHARE_CARD: (
    {
      awarded,
      displayName,
      id,
      profileImageUrl,
    }: {
      awarded: string;
      displayName: string;
      id: string;
      profileImageUrl: string | null;
    },
    closeDialog
  ) => {
    return (
      <RetroPGFShareCardDialog
        awarded={awarded}
        displayName={displayName}
        id={id}
        profileImageUrl={profileImageUrl}
        closeDialog={closeDialog}
      />
    );
  },
  SWITCH_NETWORK: ({ chain }: { chain: Chain }, closeDialog) => (
    <SwitchNetwork chain={chain} closeDialog={closeDialog} />
  ),
  DELETE_DRAFT_PROPOSAL: ({ proposalId, onDeleteSuccess }, closeDialog) => (
    <DeleteDraftProposalDialog
      closeDialog={closeDialog}
      proposalId={proposalId}
      onDeleteSuccess={onDeleteSuccess}
    />
  ),
  DELETE_ALL_DRAFT_PROPOSALS: ({ draftCount, onSuccess }, closeDialog) => (
    <DeleteAllDraftProposalsDialogComponent
      closeDialog={closeDialog}
      draftCount={draftCount}
      onSuccess={onSuccess}
    />
  ),
  CREATE_DRAFT_PROPOSAL: ({ redirectUrl, githubUrl }) => (
    <CreateDraftProposalDialog
      redirectUrl={redirectUrl}
      githubUrl={githubUrl}
    />
  ),
  UPDATE_DRAFT_PROPOSAL: ({ redirectUrl }, closeDialog) => (
    <UpdateDraftProposalDialog redirectUrl={redirectUrl} />
  ),
  SPONSOR_ONCHAIN_DRAFT_PROPOSAL: (
    { redirectUrl, txHash, isHybrid, draftProposal },
    closeDialog
  ) => (
    <SponsorOnchainProposalDialog
      redirectUrl={redirectUrl}
      txHash={txHash}
      closeDialog={closeDialog}
      isHybrid={isHybrid}
      draftProposal={draftProposal}
    />
  ),
  SPONSOR_OFFCHAIN_DRAFT_PROPOSAL: ({ redirectUrl, txHash }, closeDialog) => (
    <SponsorOffchainProposalDialog
      redirectUrl={redirectUrl}
      txHash={txHash}
      closeDialog={closeDialog}
    />
  ),
  SPONSOR_SNAPSHOT_DRAFT_PROPOSAL: (
    { redirectUrl, snapshotLink },
    closeDialog
  ) => (
    <SponsorSnapshotProposalDialog
      redirectUrl={redirectUrl}
      snapshotLink={snapshotLink}
      closeDialog={closeDialog}
    />
  ),
  OPEN_GITHUB_PR: ({ redirectUrl, githubUrl }, closeDialog) => (
    <AddGithubPRDialog
      redirectUrl={redirectUrl}
      githubUrl={githubUrl}
      closeDialog={closeDialog}
    />
  ),
  SIMULATION_REPORT: ({ report }, closeDialog) => (
    <SimulationReportDialog report={report} closeDialog={closeDialog} />
  ),
  ENCOURAGE_CONNECT_WALLET: ({}, closeDialog) => (
    <EncourageConnectWalletDialog closeDialog={closeDialog} />
  ),
  CREATE_SCOPE: ({ proposalTypeId, onSuccess }, closeDialog) => {
    return (
      <CreateScopeDialog
        proposalTypeId={proposalTypeId}
        onSuccess={onSuccess}
        closeDialog={closeDialog}
      />
    );
  },
  ACCOUNT_ACTION: ({}, closeDialog) => {
    return <CreateAccountActionDialog closeDialog={closeDialog} />;
  },
  CONFIRM: ({ title, message, onConfirm }, closeDialog) => {
    return (
      <ConfirmDialog
        title={title}
        message={message}
        onConfirm={onConfirm}
        closeDialog={closeDialog}
      />
    );
  },
  REPORT_MODAL: (
    {
      report,
      onDelete,
      onArchive,
      onCommentAdded,
      onCommentDeleted,
      onCommentUpdated,
    },
    closeDialog
  ) => {
    return (
      <ReportModal
        report={report}
        onDelete={onDelete}
        onArchive={onArchive}
        onCommentAdded={onCommentAdded}
        onCommentDeleted={onCommentDeleted}
        onCommentUpdated={onCommentUpdated}
        closeDialog={closeDialog}
      />
    );
  },
  // FAQ: () => {
  //   return <FaqDialog />;
  // },
};
