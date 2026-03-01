"use client";

import { useRef, useState } from "react";
import { HStack, VStack } from "../../Layout/Stack";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroller";
import { pluralizeSnapshotVote } from "@/lib/tokenUtils";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { SnapshotVote } from "@/app/api/common/votes/vote";

const propHeader = (vote: SnapshotVote) => {
  return `Snapshot vote - ${formatDistanceToNow(vote.createdAt)} ago`;
};

const VoteDetails = ({ vote }: { vote: SnapshotVote }) => {
  const choiceLabels = vote.choiceLabels;
  const isFor = choiceLabels[0] === "For";
  const isAgainst = choiceLabels[0] === "Against";

  return (
    <div
      className={`text-xs mt-1 font-medium space-x-[3px] ${isFor ? "text-green-700" : isAgainst ? "text-red-700" : "text-stone-500"}`}
    >
      {choiceLabels.map((label: string, idx: number) => {
        return (
          <span key={`{choice-${idx}}`}>
            {label}
            {idx < choiceLabels.length - 1 ? ", " : ""}
          </span>
        );
      })}
      <span>{pluralizeSnapshotVote(BigInt(Math.trunc(vote.votingPower)))}</span>
    </div>
  );
};

export default function SnapshotVotes({
  initialVotes,
  fetchSnapshotVotes,
}: {
  initialVotes: PaginatedResult<SnapshotVote[]>;
  fetchSnapshotVotes: (
    pagination: PaginationParams
  ) => Promise<PaginatedResult<SnapshotVote[]>>;
}) {
  const [snapshotVotes, setSnapshotVotes] = useState(initialVotes.data);
  const [snapshotMeta, setSnapshotMeta] = useState(initialVotes.meta);

  const fetching = useRef(false);

  const loadMore = async () => {
    if (!fetching.current && snapshotMeta.has_next) {
      fetching.current = true;
      const votes = await fetchSnapshotVotes({
        limit: 20,
        offset: snapshotMeta.next_offset,
      });
      setSnapshotMeta(votes.meta);
      setSnapshotVotes((prev) => prev.concat(votes.data));
      fetching.current = false;
    }
  };

  return (
    <InfiniteScroll
      hasMore={snapshotMeta.has_next}
      pageStart={0}
      loadMore={loadMore}
      useWindow={false}
      loader={
        <div key={0}>
          <HStack
            key="loader"
            className="gl_loader justify-center py-6 text-sm text-tertiary"
          >
            Loading...
          </HStack>
        </div>
      }
      element="main"
      className="divide-y divide-line overflow-hidden bg-neutral shadow-newDefault ring-1 ring-line rounded-xl"
    >
      {snapshotVotes.map(
        (vote, idx) =>
          vote && (
            <div key={`vote-${idx}`}>
              <div>
                <VStack className="py-4 px-6">
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-col flex-1 pr-4">
                      <span className="text-secondary text-xs font-medium">
                        {`${propHeader(vote)}`}
                      </span>
                      <h2 className="px-0 pt-1 overflow-hidden text-base text-primary text-ellipsis">
                        {vote.title}
                      </h2>
                      <VoteDetails vote={vote} />
                    </div>
                    {vote.reason && (
                      <div className="flex-1 border-l border-line pl-4">
                        <span className="text-xs text-tertiary leading-5 block">
                          {vote.reason}
                        </span>
                      </div>
                    )}
                  </div>
                </VStack>
              </div>
            </div>
          )
      )}
    </InfiniteScroll>
  );
}
