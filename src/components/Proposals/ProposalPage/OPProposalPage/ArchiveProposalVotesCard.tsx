"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import CastEasVoteInput from "@/components/Votes/CastVoteInput/CastEasVoteInput";
import ProposalVotesFilter from "./ProposalVotesCard/ProposalVotesFilter";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";
import { icons } from "@/assets/icons/icons";
import { Vote } from "@/app/api/common/votes/vote";
import { ProposalSingleVote } from "@/components/Votes/ProposalVotesList/ProposalSingleVote";
import { ProposalSingleNonVoter } from "@/components/Votes/ProposalVotesList/ProposalSingleNonVoter";
import type { ProposalType } from "@/lib/types";
import {
  useArchiveVotes,
  useArchiveNonVoters,
  type ArchiveVote,
  type ArchiveNonVoter,
} from "@/hooks/useArchiveProposalVotes";

const VOTES_PAGE_SIZE = 10;
const NON_VOTERS_PAGE_SIZE = 20;

type ArchiveProposalVotesCardProps = {
  proposal: Proposal;
};

export default function ArchiveProposalVotesCard({
  proposal,
}: ArchiveProposalVotesCardProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [showVoters, setShowVoters] = useState(true);

  const proposalData = proposal.proposalData as { source?: string } | undefined;
  const isFromDaoNode = proposalData?.source === "dao_node";

  const now = new Date();
  const isProposalActive =
    proposal.endTime && proposal.endTime > now && proposal.status === "ACTIVE";

  const proposalType: ProposalType = proposal.proposalType ?? "STANDARD";

  let startBlock: bigint | number | null = null;
  if (proposal.startBlock !== null && proposal.startBlock !== undefined) {
    startBlock =
      typeof proposal.startBlock === "bigint"
        ? proposal.startBlock
        : BigInt(proposal.startBlock);
  } else if (proposal.snapshotBlockNumber) {
    startBlock = BigInt(proposal.snapshotBlockNumber);
  }

  const {
    votes,
    isLoading: votesLoading,
    error: votesError,
  } = useArchiveVotes({
    proposalId: proposal.id,
    proposalType,
    startBlock,
  });

  const {
    nonVoters,
    isLoading: nonVotersLoading,
    error: nonVotersError,
  } = useArchiveNonVoters({
    proposalId: proposal.id,
  });

  const handleClick = () => {
    setIsClicked((prev) => !prev);
  };

  return (
    <>
      <div
        className={`fixed flex justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${
          isClicked
            ? "bottom-[20px]"
            : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"
        } sm:overflow-y-auto`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <div className="flex flex-col gap-4 min-h-0 shrink pt-4 w-full">
          <button
            onClick={handleClick}
            className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block md:hidden"
          >
            <div className="flex flex-col justify-center">
              <img className="opacity-60" src={icons.expand.src} alt="expand" />
            </div>
          </button>
          <div className="flex flex-col gap-4">
            <div className="font-semibold px-4 text-primary">
              Voting activity
            </div>
            <ProposalVotesSummary proposal={proposal} />
            <div className="px-4">
              <ProposalVotesFilter
                initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                onSelectionChange={(value: string) => {
                  setShowVoters(value === "Voters");
                }}
              />
            </div>
          </div>

          {showVoters ? (
            <ArchiveProposalVotesList
              proposal={proposal}
              votes={votes}
              isLoading={votesLoading}
              error={votesError}
            />
          ) : (
            <ArchiveProposalNonVoterList
              proposal={proposal}
              nonVoters={nonVoters}
              isLoading={nonVotersLoading}
              error={nonVotersError}
            />
          )}

          {isProposalActive &&
            (isFromDaoNode ? (
              <div className="border-t border-line">
                <CastVoteInput proposal={proposal} />
              </div>
            ) : (
              <div className="p-4">
                <CastEasVoteInput proposal={proposal} />
              </div>
            ))}
        </div>
      </div>

      <VoteOnAtlas
        offchainProposalId={proposal.offchainProposalId || proposal.id}
      />
    </>
  );
}

function ArchiveProposalVotesList({
  proposal,
  votes,
  isLoading,
  error,
}: {
  proposal: Proposal;
  votes: ArchiveVote[];
  isLoading: boolean;
  error: string | null;
}) {
  const { address: connectedAddress } = useAccount();
  const [visibleCount, setVisibleCount] = useState(VOTES_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(VOTES_PAGE_SIZE);
  }, [votes.length]);

  const normalizedVotes = useMemo(() => {
    return votes.map(
      (vote): Vote => ({
        transactionHash: vote.transactionHash,
        address: vote.address,
        proposalId: proposal.id,
        support: vote.support,
        weight: vote.weight,
        reason: null,
        params: null,
        proposalValue: 0n,
        proposalTitle: proposal.markdowntitle,
        proposalType: vote.proposalType,
        timestamp: null,
        blockNumber: undefined,
        citizenType: vote.citizenType,
        voterMetadata: vote.voterMetadata,
      })
    );
  }, [votes, proposal.id, proposal.markdowntitle]);

  const connectedAddressLower = useMemo(
    () => connectedAddress?.toLowerCase(),
    [connectedAddress]
  );

  const userVotes = useMemo(() => {
    if (!connectedAddressLower) {
      return [];
    }

    return normalizedVotes.filter(
      (vote) => vote.address === connectedAddressLower
    );
  }, [connectedAddressLower, normalizedVotes]);

  const userVoteAddressSet = useMemo(() => {
    return new Set(userVotes.map((vote) => vote.address));
  }, [userVotes]);

  const remainingVotes = useMemo(() => {
    return normalizedVotes.filter(
      (vote) => !userVoteAddressSet.has(vote.address)
    );
  }, [normalizedVotes, userVoteAddressSet]);

  const paginatedVotes = useMemo(() => {
    return remainingVotes.slice(0, visibleCount);
  }, [remainingVotes, visibleCount]);

  const hasMore = visibleCount < remainingVotes.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + VOTES_PAGE_SIZE, remainingVotes.length)
    );
  }, [remainingVotes.length]);

  if (isLoading) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">Loading votes...</div>
    );
  }

  if (error) {
    return <div className="px-4 pb-4 text-secondary text-xs">{error}</div>;
  }

  if (!normalizedVotes.length) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">No votes yet.</div>
    );
  }

  return (
    <div className="px-4 pb-4 overflow-y-auto min-h-[36px] max-h-[calc(100vh-437px)]">
      <InfiniteScroll
        hasMore={hasMore}
        pageStart={0}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div className="flex text-xs font-medium text-secondary" key={0}>
            Loading more votes...
          </div>
        }
        element="main"
      >
        <ul className="flex flex-col">
          {userVotes.map((vote) => (
            <li
              key={
                vote.transactionHash ||
                `${vote.address}-${vote.support}-${vote.weight}`
              }
            >
              <ProposalSingleVote vote={vote} />
            </li>
          ))}
          {paginatedVotes.map((vote) => (
            <li
              key={
                vote.transactionHash ||
                `${vote.address}-${vote.support}-${vote.weight}`
              }
            >
              <ProposalSingleVote vote={vote} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

function ArchiveProposalNonVoterList({
  proposal,
  nonVoters,
  isLoading,
  error,
}: {
  proposal: Proposal;
  nonVoters: ArchiveNonVoter[];
  isLoading: boolean;
  error: string | null;
}) {
  const [visibleCount, setVisibleCount] = useState(NON_VOTERS_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(NON_VOTERS_PAGE_SIZE);
  }, [nonVoters.length]);

  const paginatedNonVoters = useMemo(() => {
    return nonVoters.slice(0, visibleCount);
  }, [nonVoters, visibleCount]);

  const hasMore = visibleCount < nonVoters.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + NON_VOTERS_PAGE_SIZE, nonVoters.length)
    );
  }, [nonVoters.length]);

  if (isLoading) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">
        Loading hasn&apos;t voted...
      </div>
    );
  }

  if (error) {
    return <div className="px-4 pb-4 text-secondary text-xs">{error}</div>;
  }

  if (!nonVoters.length) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">
        Everyone has voted.
      </div>
    );
  }

  return (
    <div
      className="px-4 pb-4 overflow-y-auto min-h-[36px]"
      style={{ maxHeight: `calc(100vh - 437px)` }}
    >
      <InfiniteScroll
        hasMore={hasMore}
        pageStart={0}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div className="flex text-xs font-medium text-secondary" key={0}>
            Loading more voters...
          </div>
        }
        element="main"
      >
        <ul className="flex flex-col gap-2">
          {paginatedNonVoters.map((voter) => (
            <li key={voter.delegate}>
              <ProposalSingleNonVoter voter={voter} proposal={proposal} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
