"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useEASV2 } from "@/hooks/useEASV2";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useUserVotes } from "@/hooks/useProposalVotes";
import { parseVoteError } from "@/lib/voteErrorUtils";
import { VoteSuccessMessage } from "../components/VoteSuccessMessage";

interface ApprovalOption {
  index: number;
  title: string;
  description?: string;
}

interface CastEasApprovalVoteInputProps {
  proposal: Proposal;
  options: ApprovalOption[];
  maxApprovals: number;
}

export default function CastEasApprovalVoteInput({
  proposal,
  options,
  maxApprovals,
}: CastEasApprovalVoteInputProps) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();
  const { address } = useAccount();
  const { hasVoted, isLoading } = useUserVotes({
    proposalId: proposal.id,
    address,
  });

  // Check if proposal hasn't started yet
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

  return (
    <CastEasApprovalVoteInputContent
      proposal={proposal}
      options={options}
      maxApprovals={maxApprovals}
    />
  );
}

function CastEasApprovalVoteInputContent({
  proposal,
  options,
  maxApprovals,
}: CastEasApprovalVoteInputProps) {
  const { address } = useAccount();
  const { createApprovalVote, isCreatingApprovalVote } = useEASV2();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleOptionToggle = (index: number) => {
    setSelectedOptions((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= maxApprovals) {
        // Replace the last selected with the new one
        return [...prev.slice(0, -1), index];
      }
      return [...prev, index];
    });
  };

  const handleSubmitVote = async () => {
    if (selectedOptions.length === 0 || !address) {
      setError("Please select at least one option");
      return;
    }

    setError(null);

    try {
      await createApprovalVote({
        choices: selectedOptions,
        reason: reason || "",
        proposalId: proposal.id,
      });

      setSelectedOptions([]);
      setReason("");
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting approval vote:", err);
      setError(parseVoteError(err));
    }
  };

  if (isSuccess) {
    return <VoteSuccessMessage />;
  }

  return (
    <div className="w-full rounded-lg border border-line bg-neutral p-3">
      <div className="mb-3">
        <p className="text-xs text-secondary mb-2">
          Select up to {maxApprovals} option{maxApprovals > 1 ? "s" : ""}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {options.map((option) => (
          <button
            key={option.index}
            onClick={() => handleOptionToggle(option.index)}
            disabled={isCreatingApprovalVote}
            className={`w-full text-left rounded border px-3 py-2 text-sm transition ${
              selectedOptions.includes(option.index)
                ? "border-positive bg-positive/10 text-primary"
                : "border-line bg-neutral hover:border-secondary/60 text-secondary"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selectedOptions.includes(option.index)
                    ? "bg-positive border-positive"
                    : "border-secondary"
                }`}
              >
                {selectedOptions.includes(option.index) && (
                  <CheckCircleIcon className="w-3 h-3 text-white" />
                )}
              </div>
              <span>{option.title}</span>
            </div>
            {option.description && (
              <p className="text-xs text-tertiary mt-1 ml-6">
                {option.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Reason */}
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Add a reason for your vote (optional)..."
        className="w-full resize-none rounded border border-line bg-neutral px-3 py-2 text-sm text-secondary outline-none focus:border-primary focus:ring-0 mb-3"
        rows={2}
        disabled={isCreatingApprovalVote}
      />

      {error && <div className="mb-3 text-sm text-negative">{error}</div>}

      <button
        onClick={handleSubmitVote}
        disabled={
          selectedOptions.length === 0 || !address || isCreatingApprovalVote
        }
        className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreatingApprovalVote
          ? "Submitting..."
          : `Submit Vote (${selectedOptions.length}/${maxApprovals})`}
      </button>
    </div>
  );
}
