"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { useSnapshotProposalVotes } from "@/hooks/useProposalVotes";
import { cn } from "@/lib/utils";
import CopelandProposalSingleVote from "./CopelandProposalSingleVote";
import { SnapshotVote } from "@/app/api/common/votes/vote";

type Props = {
  fetchVotesForProposal: (
    proposalId: string,
    pagintation: PaginationParams
  ) => Promise<PaginatedResult<SnapshotVote[]>>;
  fetchUserVotes: (
    proposalId: string,
    address: string
  ) => Promise<SnapshotVote[]>;
  proposalId: string;
};

const LIMIT = 20;

export default function CopelandProposalVotesList({
  fetchVotesForProposal,
  fetchUserVotes,
  proposalId,
}: Props) {
  const { data: fetchedVotes, isFetched } = useSnapshotProposalVotes({
    enabled: true,
    limit: LIMIT,
    offset: 0,
    proposalId: proposalId,
  });

  const fetching = useRef(false);

  const [pages, setPages] = useState<PaginatedResult<SnapshotVote[]>[]>([]);
  const [meta, setMeta] = useState<PaginatedResult<SnapshotVote[]>["meta"]>();

  const [userVotes, setUserVotes] = useState<SnapshotVote[]>([]);
  const { address: connectedAddress } = useAccount();

  const proposalVotes = pages.flatMap((page) => page.data);

  const loadMore = async () => {
    if (!fetching.current && meta?.has_next) {
      fetching.current = true;
      const data = await fetchVotesForProposal(proposalId, {
        limit: LIMIT,
        offset: meta.next_offset,
      });
      const existingIds = new Set(proposalVotes.map((v) => v.id));
      const uniqueVotes = data?.data?.filter((v) => !existingIds.has(v.id));
      setPages((prev) => [...prev, { ...data, votes: uniqueVotes }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const fetchUserVoteAndSet = useCallback(
    async (proposalId: string, address: string) => {
      let fetchedUserVotes: SnapshotVote[];
      try {
        fetchedUserVotes = await fetchUserVotes(proposalId, address);
      } catch (error) {
        fetchedUserVotes = [];
      }
      setUserVotes(fetchedUserVotes);
    },
    [fetchUserVotes]
  );

  // Set the initial votes list
  useEffect(() => {
    if (isFetched && fetchedVotes) {
      setPages([fetchedVotes]);
      setMeta(fetchedVotes.meta);
    }
  }, [fetchedVotes, isFetched]);

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposalId, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, proposalId, fetchUserVotes, fetchUserVoteAndSet]);

  return (
    <div className={cn("overflow-y-scroll max-h-[calc(100vh-560px)]")}>
      <InfiniteScroll
        hasMore={meta?.has_next}
        pageStart={1}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div
            className="flex text-xs font-medium text-secondary justify-center pb-2"
            key={0}
          >
            Loading more votes...
          </div>
        }
      >
        <ul className="flex flex-col divide-y">
          {userVotes.map((vote) => (
            <li key={vote.id} className={`p-4`}>
              <CopelandProposalSingleVote vote={vote} />
            </li>
          ))}
          {proposalVotes.map((vote) => (
            <li
              key={vote.id}
              className={`p-4 ${
                connectedAddress?.toLowerCase() === vote.address && "hidden"
              }`}
            >
              <CopelandProposalSingleVote vote={vote} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
