"use client";

import { useOptimistic } from "react";
import { useAccount } from "wagmi";
import useDraftProposals from "@/hooks/useDraftProposals";
import { useSearchParams } from "next/navigation";
import HumanAddress from "@/components/shared/HumanAddress";
import { ProposalDraft, ProposalDraftVote } from "@prisma/client";
import Link from "next/link";
import {
  draftProposalsFilterOptions,
  draftProposalsSortOptions,
} from "@/lib/constants";
import { animate, AnimatePresence, motion } from "framer-motion";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import voteForProposalDraft from "./actions/voteForProposalDraft";

const DraftProposalCard = ({
  proposal,
  refetch,
}: {
  proposal: ProposalDraft & { votes: ProposalDraftVote[] };
  refetch: () => void;
}) => {
  const { address } = useAccount();

  const voterInVotes = proposal.votes.find((v) => v.voter === address);

  const [optimisticState, addOptimistic] = useOptimistic(
    proposal,
    (
      currentState: ProposalDraft & { votes: ProposalDraftVote[] },
      vote: any
    ) => {
      const newVotes = voterInVotes
        ? currentState.votes.map((v) => (v.voter === vote.voter ? vote : v))
        : [...currentState.votes, vote];
      return { ...currentState, votes: newVotes };
    }
  );

  const handleVote = async (direction: 1 | -1) => {
    if (!address) return;
    addOptimistic({
      voter: address,
      weight: 1,
      direction,
    });
    await voteForProposalDraft({
      address,
      proposalId: proposal.id.toString(),
      direction,
    });
    refetch();
  };

  // TODO: how inefficient is doing this client side vs db side?
  const score = optimisticState.votes.reduce(
    (acc, vote) => acc + Number(vote.weight) * vote.direction,
    0
  );

  return (
    <Link
      href={`/proposals/sponsor/${proposal.id}`}
      className="block cursor-pointer border-b border-line last:border-b-0 hover:bg-tertiary/5 transition-colors"
    >
      <div className="py-4 px-6 flex flex-row gap-4 items-center">
        <div className="flex flex-col gap-2 items-center">
          <div
            className={`w-5 h-5 bg-neutral border border-line rounded flex items-center justify-center hover:bg-tertiary/5 transition-colors ${
              voterInVotes && voterInVotes.direction === 1
                ? "bg-tertiary/5"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!address) return;
              handleVote(1);
            }}
          >
            <ChevronUpIcon className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-xs text-secondary font-bold">{score}</div>
          <div
            className={`w-5 h-5 bg-neutral border border-line rounded flex items-center justify-center hover:bg-tertiary/5 transition-colors ${
              voterInVotes && voterInVotes.direction === -1
                ? "bg-tertiary/5"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!address) return;
              handleVote(-1);
            }}
          >
            <ChevronDownIcon className="w-4 h-4 text-secondary" />
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-row gap-1 text-xs text-secondary">
            <div>
              Draft Proposal{" "}
              <span className="hidden sm:inline">
                by <HumanAddress address={proposal.author_address} />
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <span className="text-primary">{proposal.title || "Untitled"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const DraftProposalListClient = () => {
  const { address } = useAccount();
  const filter =
    useSearchParams()?.get("filter") ||
    draftProposalsFilterOptions.allDrafts.value;

  const sort =
    useSearchParams()?.get("sort") || draftProposalsSortOptions.newest.sort;

  const {
    data: draftProposals,
    isLoading,
    error,
    refetch,
  } = useDraftProposals({ address, filter, sort });

  console.log(draftProposals);

  return (
    <>
      {isLoading ? (
        <motion.div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
          <div className="flex flex-row justify-center py-8 text-tertiary">
            Loading...
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={filter}
          className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden"
        >
          <div>
            {!draftProposals || draftProposals?.length === 0 ? (
              <div className="flex flex-row justify-center py-8 text-tertiary">
                No draft proposals found
              </div>
            ) : (
              <div>
                {draftProposals?.map((proposal) => (
                  <DraftProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    refetch={refetch}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default DraftProposalListClient;
