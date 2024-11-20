"use client";

import { useAccount } from "wagmi";
import {
  useDraftProposalsInfinite,
  createQueryKey,
} from "@/hooks/useDraftProposals";
import { useSearchParams } from "next/navigation";
import {
  draftProposalsFilterOptions,
  draftProposalsSortOptions,
} from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroller";
import DraftProposalCard from "./DraftProposalCard";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";

const DraftProposalListClient = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const filter =
    useSearchParams()?.get("filter") ||
    draftProposalsFilterOptions.allDrafts.value;

  const sort =
    useSearchParams()?.get("sort") || draftProposalsSortOptions.newest.sort;

  const {
    data: draftProposals,
    isLoading: infiniteIsLoading,
    fetchNextPage: infiniteFetchNextPage,
    hasNextPage: infiniteHasNextPage,
    isFetchingNextPage: infiniteIsFetchingNextPage,
  } = useDraftProposalsInfinite({
    address,
    filter,
    sort,
    pagination: {
      limit: 10,
      offset: 0,
    },
  });

  const updateProposalVote = (proposalId: number, vote: any) => {
    queryClient.setQueryData(
      createQueryKey({ address, filter, sort }),
      (oldData: any) => {
        if (!oldData) return oldData;

        const updates = oldData.pages.map((page: any) => {
          const { data, meta } = page;
          const proposals = data;
          const proposal = proposals.find((p: any) => p.id === proposalId);

          // Did not find the proposal in this page, return page
          if (!proposal) return page;

          const existingVotes = proposal.votes;
          const voterInVotes = existingVotes.find(
            (v: any) => v.voter === vote.voter
          );
          const newVotes = voterInVotes
            ? proposal.votes.map((v: any) =>
                v.voter === vote.voter ? vote : v
              )
            : [...proposal.votes, vote];

          const newVoteWeight = newVotes.reduce(
            (acc: number, vote: any) =>
              acc + Number(vote.weight) * vote.direction,
            0
          );

          const updatedProposals = proposals.map((p: any) => {
            if (p.id !== proposalId) return p;

            return {
              ...proposal,
              votes: newVotes,
              vote_weight: newVoteWeight,
            };
          });

          return {
            ...page,
            data: updatedProposals,
          };
        });

        return {
          ...oldData,
          pages: updates,
        };
      }
    );
  };

  return (
    <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
      {infiniteIsLoading ? (
        <div className="flex flex-col justify-center py-8 text-center space-y-2">
          <AgoraLoaderSmall />
          <span className="text-tertiary">Loading draft proposals</span>
        </div>
      ) : draftProposals.length === 0 ? (
        <div className="flex flex-row justify-center py-8 text-tertiary">
          No draft proposals found
        </div>
      ) : (
        <InfiniteScroll
          hasMore={infiniteHasNextPage}
          pageStart={0}
          loadMore={() => {
            if (infiniteHasNextPage) {
              infiniteFetchNextPage();
            }
          }}
          loader={
            <div key={0}>
              <div
                key="loader"
                className="flex flex-row gl_loader justify-center py-6 text-sm text-secondary"
              >
                Loading...
              </div>
            </div>
          }
          element="main"
        >
          {draftProposals.map((proposal) => (
            <DraftProposalCard
              key={proposal.id}
              proposal={proposal}
              updateProposalVote={updateProposalVote}
            />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default DraftProposalListClient;
