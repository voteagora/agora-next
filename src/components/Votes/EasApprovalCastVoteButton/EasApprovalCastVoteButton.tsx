"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TokenAmountDisplay } from "@/lib/utils";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useArchiveUserVotingPower } from "@/hooks/useArchiveUserVotingPower";
import { useUserVotes } from "@/hooks/useProposalVotes";
import { useAccount } from "wagmi";
import { SuccessMessage } from "../CastVoteInput/CastVoteInput";
import { Vote } from "@/app/api/common/votes/vote";
import { VoteSuccessMessage } from "../CastVoteInput/CastEasOptimisticVoteInput";

type Props = {
  proposal: Proposal;
};

export default function EasApprovalCastVoteButton({ proposal }: Props) {
  const openDialog = useOpenDialog();
  const { address } = useAccount();

  const { data: votingPower, isFetching: isLoadingVP } =
    useArchiveUserVotingPower({
      proposalId: proposal.id,
      userAddress: address,
    });

  const {
    hasVoted,
    isLoading: isLoadingVotes,
    votes,
  } = useUserVotes({
    proposalId: proposal.id,
    address,
  });

  const isLoading = isLoadingVP || isLoadingVotes;

  return (
    <VStack className="flex-shrink-0">
      <VStack alignItems="items-stretch">
        {!isLoading && votingPower && (
          <div className="pt-3">
            <span className="flex items-center justify-center text-xs font-semibold text-primary">
              Proposal voting power{"\u00A0"}
              {votingPower && <TokenAmountDisplay amount={votingPower} />}
            </span>
          </div>
        )}
        <VoteButton
          onClick={() =>
            openDialog({
              type: "EAS_APPROVAL_CAST_VOTE",
              params: {
                proposal: proposal,
                votingPower: votingPower ?? null,
              },
            })
          }
          proposalStatus={proposal.status}
          proposal={proposal}
          hasVoted={hasVoted}
          isReady={!isLoading}
          votingPower={votingPower ?? null}
          votes={votes}
        />
      </VStack>
    </VStack>
  );
}

function VoteButton({
  onClick,
  proposalStatus,
  hasVoted,
  isReady,
  votes,
}: {
  onClick: () => void;
  proposalStatus: Proposal["status"];
  hasVoted: boolean;
  isReady: boolean;
  votingPower: string | null;
  proposal: Proposal;
  votes: Vote[] | null;
}) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();

  if (hasVoted) {
    return (
      <VoteSuccessMessage
        transactionHash={votes?.[0]?.transactionHash ?? null}
        timestamp={votes?.[0]?.timestamp ?? null}
      />
    );
  }

  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
  }

  if (!isConnected) {
    return (
      <Button variant={"outline"} onClick={() => setOpen(true)}>
        Connect wallet to vote
      </Button>
    );
  }

  if (!isReady) {
    return <DisabledVoteButton reason="Loading..." />;
  }

  return (
    <HStack gap={2} className="pt-1">
      <CastButton onClick={onClick} />
    </HStack>
  );
}

function CastButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className={`bg-neutral rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1`}
      onClick={onClick}
    >
      Cast Vote
    </button>
  );
}

function DisabledVoteButton({ reason }: { reason: string }) {
  return (
    <button
      disabled
      className="bg-neutral rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1"
    >
      {reason}
    </button>
  );
}
