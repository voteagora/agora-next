"use client";

import { useRef } from "react";
import { HStack, VStack } from "../../Layout/Stack";
import { formatNumber } from "@/lib/tokenUtils";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroller";
import VoteDetailsContainer from "./DelegateVotesDetailsContainer";
import VoteReason from "./DelegateVotesReason";
import ApprovalVoteReason from "./ApprovalVoteReason";
import styles from "./delegateVotes.module.scss";
import { useDelegateVotesContext } from "@/contexts/DelegateVotesContext";
import { delegatesVotesSortOptions } from "@/lib/constants";
import { pluralizeVote } from "@/lib/tokenUtils";
import DelegateVoteIcon from "./DelegateVoteIcon";

function shortPropTitle(title, proosalId) {
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

function propHeader(vote) {
  let headerString = "";
  if (vote.proposalType === "STANDARD" || vote.proposalType === "OPTIMISTIC")
    headerString = `Voted ${vote.support.toLowerCase()} this proposal `;

  if (vote.proposalType === "APPROVAL")
    if (!vote.params || vote.params?.length === 0) {
      headerString = `Abstained from voting on this proposal `;
    } else {
      headerString = `Voted on ${vote.params?.length} options in this proposal `;
    }

  if (vote.proposalValue != 0n)
    headerString += ` asking ${formatNumber(vote.proposalValue)} ETH `;

  headerString += `${formatDistanceToNow(new Date(vote.timestamp))} ago`;
  return headerString;
}

const getUniqueDelegateVotes = (delegateVotes) => {
  return delegateVotes
    .map((e) => JSON.stringify(e))
    .filter((e, i, a) => a.indexOf(e) === i)
    .map((e) => JSON.parse(e));
};

export default function DelegateVotes({ fetchDelegateVotes }) {
  const { delegatesVotesSort, delegateVotes, setDelegateVotes, meta, setMeta } =
    useDelegateVotesContext();

  const sortOrder = delegatesVotesSortOptions[delegatesVotesSort].sortOrder;

  const fetching = useRef(false);

  const loadMore = async () => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegateVotes(meta.currentPage + 1, sortOrder);
      setMeta(data.meta);
      setDelegateVotes((prev) =>
        getUniqueDelegateVotes(prev.concat(data.votes))
      );
      fetching.current = false;
    }
  };

  return (
    <InfiniteScroll
      hasMore={meta.hasNextPage}
      pageStart={0}
      loadMore={loadMore}
      useWindow={false}
      loader={
        <div key={0}>
          <HStack
            key="loader"
            className="gl_loader justify-center py-6 text-sm text-stone-500"
          >
            Loading...
          </HStack>
        </div>
      }
      element="main"
      className="divide-y divide-gray-300 overflow-hidden bg-white shadow-newDefault ring-1 ring-gray-300 rounded-xl"
    >
      {delegateVotes.map(
        (vote) =>
          vote && (
            <VoteDetailsContainer
              key={vote.transactionHash}
              proposalId={vote.proposal_id}
            >
              <div className={styles.details_container}>
                <VStack className={styles.details_sub}>
                  <HStack justifyContent="justify-between" gap={2}>
                    <VStack>
                      <span className="text-[#66676b] text-xs font-medium">
                        {`${propHeader(vote)} with ${pluralizeVote(vote.weight, "optimism")}`}
                      </span>
                      <h2 className="px-0 pt-1 overflow-hidden text-base text-black text-ellipsis">
                        {shortPropTitle(vote.proposalTitle, vote.proposal_id)}
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
