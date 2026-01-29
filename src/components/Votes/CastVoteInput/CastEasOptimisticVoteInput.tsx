"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useEASV2 } from "@/hooks/useEASV2";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useUserVotes } from "@/hooks/useProposalVotes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { icons } from "@/icons/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseVoteError } from "@/lib/voteErrorUtils";
import { VoteSuccessMessage } from "../components/VoteSuccessMessage";

interface CastEasOptimisticVoteInputProps {
  proposal: Proposal;
  vetoThreshold?: number;
}

export default function CastEasOptimisticVoteInput({
  proposal,
  vetoThreshold = 20,
}: CastEasOptimisticVoteInputProps) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();
  const { address } = useAccount();
  const { hasVoted, isLoading, votes } = useUserVotes({
    proposalId: proposal.id,
    address,
  });

  const now = new Date();
  const hasNotStarted = proposal.startTime && proposal.startTime > now;
  if (!isConnected) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <Button className="w-full" onClick={() => setOpen(true)}>
          Connect wallet to vote
        </Button>
      </div>
    );
  }

  if (hasNotStarted) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <Button className="w-full" disabled>
          Voting has not started yet
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <Button className="w-full" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="p-4">
        <VoteSuccessMessage
          transactionHash={null}
          timestamp={votes?.[0]?.timestamp}
          showTimestamp={true}
        />
      </div>
    );
  }

  return (
    <CastEasOptimisticVoteInputContent
      proposal={proposal}
      vetoThreshold={vetoThreshold}
    />
  );
}

function CastEasOptimisticVoteInputContent({
  proposal,
  vetoThreshold,
}: CastEasOptimisticVoteInputProps) {
  const { address } = useAccount();
  const { createOptimisticVote, isCreatingOptimisticVote } = useEASV2();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [support, setSupport] = useState<"AGAINST" | null>(null);
  const [voteTimestamp, setVoteTimestamp] = useState<Date | null>(null);

  const handleVoteClick = () => {
    setSupport(support === "AGAINST" ? null : "AGAINST");
  };

  const handleSubmitVote = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!support) {
      setError("Please select a vote option");
      return;
    }

    setError(null);

    try {
      const result = await createOptimisticVote({
        reason: reason || "",
        proposalId: proposal.id,
      });

      setTransactionHash(result.transactionHash);
      setVoteTimestamp(new Date());
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting optimistic vote:", err);
      setError(parseVoteError(err));
    }
  };

  const reset = () => {
    setError(null);
    setSupport(null);
    setReason("");
  };

  const resetError = () => {
    setError(null);
  };

  if (isSuccess) {
    return (
      <div className="p-4">
        <VoteSuccessMessage
          transactionHash={transactionHash}
          timestamp={voteTimestamp}
          showTimestamp={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-shrink rounded-b-lg">
      <div className="flex flex-col flex-shrink">
        <div className="flex flex-col items-stretch justify-between">
          {!error && (
            <div className="px-4 pb-3 pt-1">
              {!isCreatingOptimisticVote && (
                <div className="flex flex-col gap-2">
                  {proposal.status === "ACTIVE" && (
                    <textarea
                      placeholder="I believe..."
                      value={reason || undefined}
                      onChange={(e) => setReason(e.target.value)}
                      rows={reason ? undefined : 1}
                      className="text-sm text-primary resize-none rounded-lg border border-line rounded-b-lg focus:outline-none focus:inset-0 focus:shadow-none focus:outline-offset-0 mt-3"
                    />
                  )}
                  <div className={cn(proposal.status !== "ACTIVE" && "mt-3")}>
                    <VoteButton
                      proposalStatus={proposal.status}
                      support={support}
                      onVoteClick={handleVoteClick}
                    />
                  </div>
                </div>
              )}
              {isCreatingOptimisticVote && <LoadingVote />}
              {!isCreatingOptimisticVote && proposal.status === "ACTIVE" && (
                <VoteSubmitButton
                  support={support}
                  onSubmit={handleSubmitVote}
                />
              )}
            </div>
          )}
          {error && (
            <ErrorState
              message="Error submitting vote"
              error={error}
              button1={{
                message: "Cancel",
                action: reset,
              }}
              button2={{
                message: "Try again",
                action: () => {
                  resetError();
                  setTimeout(() => handleSubmitVote(), 50);
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function VoteButton({
  proposalStatus,
  support,
  onVoteClick,
}: {
  proposalStatus: Proposal["status"];
  support: "AGAINST" | null;
  onVoteClick: () => void;
}) {
  if (proposalStatus !== "ACTIVE") {
    return (
      <Button className="w-full" disabled={true}>
        Not open to voting
      </Button>
    );
  }

  const selectedStyle =
    support === "AGAINST" ? "border-negative bg-negative/10" : "bg-neutral";

  return (
    <div className="flex flex-row gap-2 pt-1">
      <button
        className={`text-negative ${selectedStyle} rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1`}
        onClick={onVoteClick}
      >
        against
      </button>
    </div>
  );
}

function VoteSubmitButton({
  support,
  onSubmit,
}: {
  support: "AGAINST" | null;
  onSubmit: () => void;
}) {
  return (
    <div className="pt-3">
      <Button onClick={onSubmit} className="w-full" disabled={!support}>
        Submit vote
      </Button>
    </div>
  );
}

function LoadingVote() {
  return (
    <div className="flex flex-col w-full pt-3">
      <div className="mb-2 text-sm text-secondary font-medium">
        Casting your vote
      </div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <Button className="w-full" disabled={true}>
          Approve transaction in your wallet to vote
        </Button>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  button1,
  button2,
  error,
}: {
  message: string;
  button1: { message: string; action: () => void };
  button2: { message: string; action: () => void };
  error: any;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-3 p-3 border-t border-line">
            <div className="py-2 px-4 bg-red-300 text-xs text-red-700 font-medium rounded-lg flex items-center gap-2">
              <Image
                src={icons.infoRed}
                alt="Info"
                width={24}
                height={24}
                className="text-red-700"
              />
              {message}
            </div>
            <div className="flex flex-row gap-2">
              <Button
                className="w-full"
                variant="elevatedOutline"
                onClick={button1.action}
              >
                {button1.message}
              </Button>
              <Button className="w-full" onClick={button2.action}>
                {button2.message}
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            {JSON.stringify(
              error || {},
              (key, value) =>
                typeof value === "bigint" ? value.toString() + "n" : value,
              2
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
