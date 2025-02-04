"use client";

import InfiniteScroll from "react-infinite-scroller";
import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { useAccount } from "wagmi";
import DraftProposalCard from "./DraftProposalCard";

const DraftProposalListClient = ({
  initDraftProposals,
  fetchDraftProposals,
}: {
  initDraftProposals: PaginatedResult<any[]>;
  fetchDraftProposals: (
    address: `0x${string}` | undefined,
    filter: string,
    sort: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<any[]>>;
}) => {
  const { address } = useAccount();
  const [pages, setPages] = useState([initDraftProposals]);
  const [meta, setMeta] = useState(initDraftProposals.meta);
  const filter = useSearchParams()?.get("filter") || "relevant";
  const sort = useSearchParams()?.get("sort") || "newest";
  const fetching = useRef(false);

  useEffect(() => {
    const resetAndFetch = async () => {
      fetching.current = true;
      const data = await fetchDraftProposals(address, filter, sort, {
        limit: 10,
        offset: 0,
      });
      setPages([data]);
      setMeta(data.meta);
      fetching.current = false;
    };

    resetAndFetch();
  }, [filter, sort, address]);

  const loadMore = async () => {
    if (fetching.current || !meta.has_next) return;
    fetching.current = true;
    const data = await fetchDraftProposals(address, filter, sort, {
      limit: 10,
      offset: meta.next_offset,
    });
    setPages((prev) => [...prev, { ...data, proposals: data.data }]);
    setMeta(data.meta);
    fetching.current = false;
  };

  const proposals = pages.flatMap((page) => page.data);

  // optimistically updates vote weight
  // (JUST UPDATES UI SO CHANGE IS REFLECTED IMMEDIATELY)
  const updateProposalVote = (
    proposalId: number,
    vote: {
      voter: string;
      weight: number;
      direction: 1 | -1;
    }
  ) => {
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        data: page.data.map((proposal) => {
          if (proposal.id !== proposalId) return proposal;

          const existingVote = proposal.votes?.find(
            (v: { voter: string }) => v.voter === vote.voter
          );

          // Case 1: No previous vote - add new vote
          if (!existingVote) {
            return {
              ...proposal,
              vote_weight:
                Number(proposal.vote_weight) + vote.weight * vote.direction,
              votes: [...(proposal.votes || []), vote],
            };
          }

          // Case 2: Voting in opposite direction - update vote
          if (existingVote.direction !== vote.direction) {
            return {
              ...proposal,
              vote_weight:
                Number(proposal.vote_weight) + 2 * vote.weight * vote.direction,
              votes: proposal.votes.map((v: { voter: string }) =>
                v.voter === vote.voter ? vote : v
              ),
            };
          }

          // Case 3: Same direction - no effect
          return proposal;
        }),
      }))
    );
  };

  return (
    <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
      <div>
        {proposals.length === 0 ? (
          <div className="flex flex-row justify-center py-8 text-secondary">
            No submissions found
          </div>
        ) : (
          <InfiniteScroll
            hasMore={meta.has_next}
            pageStart={0}
            loadMore={loadMore}
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
            {proposals.map((proposal) => (
              <DraftProposalCard
                key={proposal.id}
                proposal={proposal}
                updateProposalVote={updateProposalVote}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default DraftProposalListClient;
