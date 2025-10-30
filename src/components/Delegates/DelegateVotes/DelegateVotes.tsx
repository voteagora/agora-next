"use client";

import { useRef, useState } from "react";
import { HStack, VStack } from "../../Layout/Stack";
import { formatNumber } from "@/lib/tokenUtils";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroller";
import VoteDetailsContainer from "./DelegateVotesDetailsContainer";
import VoteReason from "./DelegateVotesReason";
import ApprovalVoteReason from "./ApprovalVoteReason";
import { pluralizeVote } from "@/lib/tokenUtils";
import DelegateVoteIcon from "./DelegateVoteIcon";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { Vote } from "@/app/api/common/votes/vote";

function shortPropTitle(title: string, proosalId: string) {
  // This is a hack to hide a proposal formatting mistake from the OP Foundation
  const proposalsWithBadFormatting = [
    "114732572201709734114347859370226754519763657304898989580338326275038680037913",
    "27878184270712708211495755831534918916136653803154031118511283847257927730426",
    "90839767999322802375479087567202389126141447078032129455920633707568400402209",
  ];

  // This is a hack to hide a proposal formatting mistake from the OP Foundation
  return proposalsWithBadFormatting.includes(proosalId)
    ? title.split("-")[0].split("(")[0]
    : title;
}

function propHeader(vote: Vote) {
  let headerString = "";
  const isTempCheck = (vote as any).isTempCheck === true;
  const noun = isTempCheck ? "temp check" : "proposal";
  if (vote.proposalType === "STANDARD" || vote.proposalType === "OPTIMISTIC")
    headerString = `Voted ${vote.support.toLowerCase()} this ${noun} `;

  if (vote.proposalType === "APPROVAL")
    if (!vote.params || vote.params?.length === 0) {
      headerString = `Abstained from voting on this proposal `;
    } else {
      headerString = `Voted on ${vote.params?.length} options in this proposal `;
    }

  if (vote.proposalValue != 0n)
    headerString += ` asking ${formatNumber(vote.proposalValue)} ETH `;

  headerString += `${formatDistanceToNow(new Date(vote.timestamp ?? 0))} ago`;
  return headerString;
}

export default function DelegateVotes({
  initialVotes,
  fetchDelegateVotes,
}: {
  initialVotes: PaginatedResult<Vote[]>;
  fetchDelegateVotes: (
    pagination: PaginationParams
  ) => Promise<PaginatedResult<Vote[]>>;
}) {
  const [delegateVotes, setDelegateVotes] = useState(initialVotes.data);
  const [meta, setMeta] = useState(initialVotes.meta);

  const fetching = useRef(false);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchDelegateVotes({
        offset: meta.next_offset,
        limit: 20,
      });
      setMeta(data.meta);
      setDelegateVotes((prev) => prev.concat(data.data));
      fetching.current = false;
    }
  };

  return (
    <InfiniteScroll
      hasMore={meta.has_next}
      pageStart={0}
      loadMore={loadMore}
      useWindow={false}
      loader={
        <div key={0}>
          <HStack
            key="loader"
            className="gl_loader justify-center py-6 text-sm text-secondary"
          >
            Loading...
          </HStack>
        </div>
      }
      element="main"
      className="divide-y divide-line overflow-hidden bg-neutral shadow-newDefault ring-1 ring-line rounded-xl"
    >
      {delegateVotes.map(
        (vote) =>
          vote && (
            <VoteDetailsContainer
              key={vote.transactionHash}
              proposalId={vote.proposalId}
            >
              <div>
                <VStack className="py-4 px-6">
                  <HStack justifyContent="justify-between" gap={2}>
                    <VStack>
                      <span className="text-tertiary text-xs font-medium">
                        {`${propHeader(vote)} with ${pluralizeVote(BigInt(vote.weight))}`}
                      </span>
                      <h2 className="px-0 pt-1 overflow-hidden text-base text-primary text-ellipsis">
                        {shortPropTitle(vote.proposalTitle, vote.proposalId)}
                      </h2>
                    </VStack>
                    <DelegateVoteIcon {...vote} />
                  </HStack>
                  {(vote.proposalType === "APPROVAL" || vote.reason) && (
                    <VStack className="space-y-1 mt-2">
                      {vote.proposalType === "APPROVAL" && (
                        <ApprovalVoteReason {...vote} />
                      )}
                      {vote.reason && <VoteReason reason={vote.reason} />}
                    </VStack>
                  )}
                </VStack>
              </div>
            </VoteDetailsContainer>
          )
      )}
    </InfiniteScroll>
  );
}
