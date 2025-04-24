import { DialogDefinitions } from "./types";
import { DelegateDialog } from "../DelegateDialog/DelegateDialog";
import { UndelegateDialog } from "../UndelegateDialog/UndelegateDialog";
import { SwitchNetwork } from "../SwitchNetworkDialog/SwitchNetworkDialog";
import { CastProposalDialog } from "@/components/Proposals/ProposalCreation/CastProposalDialog";
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
import CreateDraftProposalDialog from "@/app/proposals/draft/components/dialogs/CreateDraftProposalDialog";
import UpdateDraftProposalDialog from "@/app/proposals/draft/components/dialogs/UpdateDraftProposalDialog";
import SponsorOnchainProposalDialog from "@/app/proposals/draft/components/dialogs/SponsorOnchainProposalDialog";
import SponsorSnapshotProposalDialog from "@/app/proposals/draft/components/dialogs/SponsorSnapshotProposalDialog";
import AddGithubPRDialog from "@/app/proposals/draft/components/dialogs/AddGithubPRDialog";
import { ANALYTICS_EVENT_NAMES, StakedDeposit } from "@/lib/types";
import { fetchAllForAdvancedDelegation } from "@/app/delegates/actions";
import { PartialDelegationDialog } from "@/components/Dialogs/PartialDelegateDialog/PartialDelegationDialog";
import SubscribeDialog from "@/components/Notifications/SubscribeDialog";
import { ShareDialog as ShareVoteDialog } from "@/components/Proposals/ProposalPage/ShareVoteDialog/ShareVoteDialog";
import { Vote } from "@/app/api/common/votes/vote";
import { SimulationReportDialog } from "../SimulationReportDialog/SimulationReportDialog";
import { StructuredSimulationReport } from "@/lib/seatbelt/types";
import { EncourageConnectWalletDialog } from "@/components/Delegates/Delegations/EncourageConnectWalletDialog";

export type DialogType =
  | AdvancedDelegateDialogType
  | ApprovalCastVoteDialogType
  | CastProposalDialogType
  | CastVoteDialogType
  | CreateDraftProposalDialog
  | DelegateDialogType
  | DeleteDraftProposalDialog
  | OpenGithubPRDialog
  | PartialDelegateDialogType
  | RetroPGFShareCardDialog
  | SponsorOnchainDraftProposalDialog
  | SponsorSnapshotDraftProposalDialog
  | SwithcNetworkDialogType
  | UndelegateDialogType
  | UpdateDraftProposalDialog
  | OpenGithubPRDialog
  | SubscribeDialog
  | ShareVoteDialogType
  | SimulationReportDialogType
  | EncourageConnectWalletDialogType;
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
    proposalType: "OPTIMISTIC" | "STANDARD" | "APPROVAL" | "SNAPSHOT";
    proposal: Proposal;
    newVote: {
      support: string;
      reason: string;
      params: string[];
      weight: string;
    };
    totalOptions: number;
    votes: Vote[];
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
  votingPower: VotingPowerData;
  authorityChains: string[][];
  missingVote: MissingVote;
  closeDialog: () => void;
};

export type ApprovalCastVoteDialogType = {
  type: "APPROVAL_CAST_VOTE";
  params: Omit<ApprovalCastVoteDialogProps, "closeDialog">;
};

export type DeleteDraftProposalDialog = {
  type: "DELETE_DRAFT_PROPOSAL";
  params: { proposalId: number };
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
  params: { redirectUrl: string; txHash: `0x${string}` };
};

export type OpenGithubPRDialog = {
  type: "OPEN_GITHUB_PR";
  params: { redirectUrl: string; githubUrl: string };
};

export type SubscribeDialog = {
  type: "SUBSCRIBE";
  params: { type: "root" | "vote" };
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
  DELETE_DRAFT_PROPOSAL: ({ proposalId }, closeDialog) => (
    <DeleteDraftProposalDialog
      closeDialog={closeDialog}
      proposalId={proposalId}
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
  SPONSOR_ONCHAIN_DRAFT_PROPOSAL: ({ redirectUrl, txHash }, closeDialog) => (
    <SponsorOnchainProposalDialog
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
  SUBSCRIBE: ({ type }, closeDialog) => {
    return <SubscribeDialog closeDialog={closeDialog} type={type} />;
  },
  SIMULATION_REPORT: ({ report }, closeDialog) => (
    <SimulationReportDialog report={report} closeDialog={closeDialog} />
  ),
  ENCOURAGE_CONNECT_WALLET: ({}, closeDialog) => (
    <EncourageConnectWalletDialog closeDialog={closeDialog} />
  ),
  // FAQ: () => {
  //   return <FaqDialog />;
  // },
};
