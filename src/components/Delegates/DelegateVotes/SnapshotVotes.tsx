"use client";

import { useRef, useState } from "react";
import { HStack, VStack } from "../../Layout/Stack";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroller";
import { pluralizeSnapshotVote } from "@/lib/tokenUtils";

const propHeader = (vote: any) => {
  let headerString = "Snapshot vote - ";
  headerString += `${formatDistanceToNow(new Date(vote.created * 1000))} ago`;
  return headerString;
};

const VoteDetails = ({ vote }: { vote: any }) => {
  const choiceLabels = vote.choice_labels;
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
      <span>{pluralizeSnapshotVote(BigInt(Math.trunc(vote.vp)))}</span>
    </div>
  );
};

export default function SnapshotVotes({
  meta,
  initialVotes,
  fetchSnapshotVotes,
}: {
  meta: any;
  initialVotes: any;
  fetchSnapshotVotes: any;
}) {
  const [snapshotVotes, setSnapshotVotes] = useState(initialVotes);
  const [snapshotMeta, setSnapshotMeta] = useState(meta);

  const fetching = useRef(false);

  const loadMore = async () => {
    if (!fetching.current && snapshotMeta?.hasNextPage) {
      fetching.current = true;
      const data = await fetchSnapshotVotes(snapshotMeta?.currentPage + 1);
      setSnapshotMeta(data.snapshotMeta);
      setSnapshotVotes((prev: any) => prev.concat(data.votes));
      fetching.current = false;
    }
  };

  return (
    <InfiniteScroll
      hasMore={snapshotMeta?.hasNextPage}
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
      className="divide-y divide-line overflow-hidden bg-white shadow-newDefault ring-1 ring-line rounded-xl"
    >
      {snapshotVotes.map(
        (vote: any, idx: number) =>
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
                    <div className="flex-1 border-l border-line pl-4">
                      <span className="text-xs text-tertiary leading-5 block">
                        {vote.reason}
                      </span>
                    </div>
                  </div>
                </VStack>
              </div>
            </div>
          )
      )}
    </InfiniteScroll>
  );
}
