"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { Vote } from "@/app/api/common/votes/vote";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import { MissingVote, checkMissingVoteForDelegate } from "@/lib/voteUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TokenAmountDisplay } from "@/lib/utils";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

type Props = {
  proposal: Proposal;
  fetchAllForVoting: (
    address: string | `0x${string}`,
    blockNumber: number,
    proposalId: string
  ) => Promise<{
    votingPower: VotingPowerData;
    authorityChains: string[][];
    delegate: Delegate;
    votesForProposalAndDelegate: Vote[];
  }>;
};

export default function ApprovalCastVoteButton({
  proposal,
  fetchAllForVoting,
}: Props) {
  const [votingPower, setVotingPower] = useState<VotingPowerData>({
    directVP: "0",
    advancedVP: "0",
    totalVP: "0",
  });
  const [delegate, setDelegate] = useState<Delegate>();
  const [chains, setChains] = useState<string[][]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isReady, setIsReady] = useState(false);
  const openDialog = useOpenDialog();

  const { address } = useAccount();

  const fetchData = useCallback(async () => {
    setIsReady(false);
    try {
      const {
        votingPower,
        authorityChains,
        delegate,
        votesForProposalAndDelegate,
      } = await fetchAllForVoting(
        address!,
        proposal.snapshotBlockNumber,
        proposal.id
      );

      setVotingPower(votingPower);
      setDelegate(delegate);
      setChains(authorityChains);
      setVotes(votesForProposalAndDelegate);
      setIsReady(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [address, proposal, fetchAllForVoting]);

  useEffect(() => {
    if (address && proposal.snapshotBlockNumber) {
      fetchData();
    }
  }, [fetchData, address, proposal.snapshotBlockNumber]);

  return (
    <VStack className="flex-shrink-0">
      <VStack alignItems="items-stretch">
        {isReady && (
          <div className="pt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full flex items-center justify-center gap-1 text-primary font-medium cursor-help">
                  <span className="flex items-center text-xs font-semibold text-primary">
                    Proposal voting power{"\u00A0"}
                    <TokenAmountDisplay amount={votingPower.totalVP} />
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
          onClick={(missingVote: MissingVote) =>
            openDialog({
              type: "APPROVAL_CAST_VOTE",
              params: {
                proposal: proposal,
                hasStatement: !!delegate?.statement,
                votingPower,
                authorityChains: chains,
                missingVote,
              },
            })
          }
          proposalStatus={proposal.status}
          delegateVotes={votes}
          isReady={isReady}
          votingPower={votingPower}
        />
      </VStack>
    </VStack>
  );
}

function VoteButton({
  onClick,
  proposalStatus,
  delegateVotes,
  isReady,
  votingPower,
}: {
  onClick: (missingVote: MissingVote) => void;
  proposalStatus: Proposal["status"];
  delegateVotes: Vote[];
  isReady: boolean;
  votingPower: VotingPowerData;
}) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();

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

  const missingVote = checkMissingVoteForDelegate(delegateVotes, votingPower);

  if (missingVote === "NONE") {
    return <DisabledVoteButton reason="Already voted" />;
  }

  return (
    <HStack gap={2} className="pt-1">
      <CastButton
        onClick={() => {
          onClick(missingVote);
        }}
      />
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
