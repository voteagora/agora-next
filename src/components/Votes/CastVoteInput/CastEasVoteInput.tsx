"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useUserVotes } from "@/hooks/useProposalVotes";
import { useArchiveUserVotingPower } from "@/hooks/useArchiveUserVotingPower";
import { TokenAmountDisplay } from "@/lib/utils";
import { parseVoteError } from "@/lib/voteErrorUtils";
import { VoteSuccessMessage } from "../components/VoteSuccessMessage";
import { DisabledVoteButton } from "../components/DisabledVoteButton";
import CastEasApprovalVoteInput from "./CastEasApprovalVoteInput";
import CastEasOptimisticVoteInput from "./CastEasOptimisticVoteInput";
import { useEASV2 } from "@/hooks/useEASV2";

type VoteOption = "for" | "against" | "abstain" | null;

export default function CastEasVoteInput({ proposal }: { proposal: Proposal }) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();
  const { address } = useAccount();
  const { hasVoted, isLoading } = useUserVotes({
    proposalId: proposal.id,
    address,
    proposal,
  });
  // Get voting type info from proposal

  // Check if proposal hasn't started yet
  const now = new Date();
  const hasNotStarted = proposal.startTime && proposal.startTime > now;

  if (proposal.status !== "ACTIVE") {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <DisabledVoteButton reason="Not open to voting" />
      </div>
    );
  }

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
        <DisabledVoteButton reason="Voting has not started yet" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full rounded-lg border border-line bg-neutral p-4">
        <div className="flex items-center justify-center">
          <div className="text-sm text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return <VoteSuccessMessage />;
  }

  // Route to appropriate vote input based on voting type
  if (proposal.proposalType === "APPROVAL") {
    return (
      <CastEasApprovalVoteInput
        proposal={proposal}
        options={(proposal.proposalData as any).options.map(
          (option: any, index: number) => ({
            index,
            title: option.description,
          })
        )}
        maxApprovals={
          (proposal.proposalData as any).proposalSettings.maxApprovals
        }
      />
    );
  }
  if (proposal.proposalType === "OPTIMISTIC") {
    return (
      <CastEasOptimisticVoteInput proposal={proposal} vetoThreshold={20} />
    );
  }

  // Default to standard voting
  return <CastEasVoteInputContent proposal={proposal} />;
}

function CastEasVoteInputContent({ proposal }: { proposal: Proposal }) {
  const { address } = useAccount();
  const { createStandardVote, isCreatingStandardVote } = useEASV2();
  const [selectedVote, setSelectedVote] = useState<VoteOption>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: votingPower } = useArchiveUserVotingPower({
    proposalId: proposal.id,
    userAddress: address,
  });

  const handleSubmitVote = async () => {
    if (!selectedVote || !address) {
      setError("Please connect wallet and select a vote option");
      return;
    }

    setError(null);

    try {
      const choiceMap = {
        against: 0,
        for: 1,
        abstain: 2,
      };

      await createStandardVote({
        choice: choiceMap[selectedVote],
        reason: reason || "",
        proposalId: proposal.id,
      });

      setSelectedVote(null);
      setReason("");
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError(parseVoteError(err));
    }
  };

  if (isSuccess) {
    return <VoteSuccessMessage />;
  }

  return (
    <div className="w-full rounded-lg border border-line bg-neutral p-3">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="I believe..."
        className="w-full resize-none rounded border-none  bg-neutral px-3 text-sm text-secondary outline-none focus:border-primary focus:ring-0"
        rows={1}
        disabled={isCreatingStandardVote}
      />

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setSelectedVote("for")}
          disabled={isCreatingStandardVote}
          className={`flex-1 rounded border px-3 py-2 text-sm font-semibold transition text-positive ${
            selectedVote === "for"
              ? "border-positive bg-positive/10"
              : "border-line bg-neutral hover:border-positive/60"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          For
        </button>

        <button
          onClick={() => setSelectedVote("against")}
          disabled={isCreatingStandardVote}
          className={`flex-1 rounded border px-3 py-2 text-sm font-semibold transition text-negative ${
            selectedVote === "against"
              ? "border-negative bg-negative/10"
              : "border-line bg-neutral hover:border-negative/60"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Against
        </button>

        <button
          onClick={() => setSelectedVote("abstain")}
          disabled={isCreatingStandardVote}
          className={`flex-1 rounded border px-3 py-2 text-sm font-semibold transition text-secondary ${
            selectedVote === "abstain"
              ? "border-secondary bg-secondary/10"
              : "border-line bg-neutral hover:border-secondary/60"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Abstain
        </button>
      </div>

      {error && <div className="mb-3 text-sm text-negative">{error}</div>}

      <button
        onClick={handleSubmitVote}
        disabled={!selectedVote || !address || isCreatingStandardVote}
        className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreatingStandardVote ? (
          "Submitting..."
        ) : (
          <>
            Submit vote
            {votingPower && (
              <>
                {" "}
                with{"\u00A0"} <TokenAmountDisplay amount={votingPower} />
              </>
            )}
          </>
        )}
      </button>
    </div>
  );
}
