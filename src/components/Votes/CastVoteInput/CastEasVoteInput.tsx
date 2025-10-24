"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { createVoteAttestation } from "@/lib/eas";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

type VoteOption = "for" | "against" | "abstain" | null;

export default function CastEasVoteInput({ proposal }: { proposal: Proposal }) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();
  const permissions = useForumPermissionsContext();

  // Check if proposal hasn't started yet
  const now = new Date();
  const hasNotStarted = proposal.startTime && proposal.startTime > now;

  // Check if user has voting power
  const currentVP = parseInt(permissions.currentVP) || 0;
  const hasVotingPower = currentVP > 0;

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

  if (!hasVotingPower) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <DisabledVoteButton reason="You need voting power to vote" />
      </div>
    );
  }

  return <CastEasVoteInputContent proposal={proposal} />;
}

function CastEasVoteInputContent({ proposal }: { proposal: Proposal }) {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedVote, setSelectedVote] = useState<VoteOption>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitVote = async () => {
    if (!selectedVote || !address || !walletClient || !chain) {
      setError("Please connect wallet and select a vote option");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create signer from wallet client
      const network = { chainId: chain.id, name: chain.name };
      const provider = new BrowserProvider(walletClient.transport, network);
      const signer = new JsonRpcSigner(provider, address);

      // Map vote option to choice number: 0 = against, 1 = for, 2 = abstain
      const choiceMap = {
        against: 0,
        for: 1,
        abstain: 2,
      };

      await createVoteAttestation({
        proposalId: proposal.id,
        choice: choiceMap[selectedVote],
        reason: reason || "",
        signer,
      });

      // Reset form on success
      setSelectedVote(null);
      setReason("");
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError(err instanceof Error ? err.message : "Failed to submit vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full rounded-lg border border-line bg-neutral p-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="text-positive text-lg font-semibold">
            Vote submitted successfully!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-line bg-neutral p-4">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="I believe..."
        className="mb-4 w-full resize-none rounded border-none  bg-neutral px-3 py-2 text-sm text-secondary outline-none focus:border-primary focus:ring-0"
        rows={2}
        disabled={isSubmitting}
      />

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSelectedVote("for")}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
        disabled={!selectedVote || !address || isSubmitting}
        className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Vote"}
      </button>
    </div>
  );
}

function DisabledVoteButton({ reason }: { reason: string }) {
  return (
    <Button className="w-full" disabled>
      {reason}
    </Button>
  );
}
