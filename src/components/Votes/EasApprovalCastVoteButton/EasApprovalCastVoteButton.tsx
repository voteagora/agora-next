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

  const { hasVoted, isLoading: isLoadingVotes } = useUserVotes({
    proposalId: proposal.id,
    address,
  });

  const isLoading = isLoadingVP || isLoadingVotes;

  return (
    <VStack className="flex-shrink-0">
      <VStack alignItems="items-stretch">
        {!isLoading && votingPower && (
          <div className="pt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full flex items-center justify-center gap-1 text-primary font-medium cursor-help">
                  <span className="flex items-center text-xs font-semibold text-primary">
                    Proposal voting power{"\u00A0"}
                    {votingPower && <TokenAmountDisplay amount={votingPower} />}
                    <InformationCircleIcon className="w-4 h-4 ml-1" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="bg-neutral p-4 rounded-lg border border-line shadow-newDefault w-[calc(100vw-32px)] sm:w-[400px]"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        Proposal launched
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          timeZoneName: "short",
                        }).format(new Date(proposal.startTime ?? ""))}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Your voting power is captured when proposals launch based
                      on your token holdings and delegations at that time.
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Any changes to your holdings after launch will not affect
                      voting on this proposal.
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
  votingPower,
  proposal,
}: {
  onClick: () => void;
  proposalStatus: Proposal["status"];
  hasVoted: boolean;
  isReady: boolean;
  votingPower: string | null;
  proposal: Proposal;
}) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();

  if (hasVoted) {
    return (
      <SuccessMessage proposal={proposal} votes={[]} className="px-0 pb-0" />
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
