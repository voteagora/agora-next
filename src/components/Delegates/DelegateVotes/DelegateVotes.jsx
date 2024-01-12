"use client";

import { useRef } from "react";
import { HStack, VStack } from "../../Layout/Stack";
import { formatNumber } from "@/lib/tokenUtils";
import { shortAddress } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroller";
import Image from "next/image";
import VoteDetailsContainer from "./DelegateVotesDetailsContainer";
import VoteReason from "./DelegateVotesReason";
import StandardVoteContainer from "./StandardVoteContainer";
import ApprovalVoteContainer from "./ApprovalVoteContainer";
import styles from "./delegateVotes.module.scss";
import { useDelegateVotesContext } from "@/contexts/DelegateVotesContext";
import { delegatesVotesSortOptions } from "@/lib/constants";

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

  const loadMore = async (page) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegateVotes(page, sortOrder);
      setMeta(data.meta);
      setDelegateVotes((prev) =>
        getUniqueDelegateVotes(prev.concat(data.votes))
      );
      fetching.current = false;
    }
  };

  return (
    <VStack gap={4}>
      <InfiniteScroll
        hasMore={meta.hasNextPage}
        pageStart={0}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div key="loader">
            Loading... <br />
            <Image
              src="/images/blink.gif"
              alt="Blinking Agora Logo"
              width={50}
              height={20}
            />
          </div>
        }
        element="main"
        className="flex flex-col gap-4"
      >
        {delegateVotes.map(
          (vote) =>
            vote && (
              <VoteDetailsContainer key={vote.transactionHash}>
                <div className={styles.details_container}>
                  <VStack className={styles.details_sub}>
                    <HStack gap={1} className={styles.vote_type}>
                      <a
                        href={`/proposals/${vote.proposal_id}`}
                        title={`Prop ${vote.proposal_id}`}
                      >
                        Prop {shortAddress(vote.proposal_id)}
                      </a>
                      <>
                        {vote.proposalValue != 0n ? (
                          <> asking {formatNumber(vote.proposalValue)} ETH</>
                        ) : null}{" "}
                      </>
                      {vote.timestamp && (
                        <div>
                          - {formatDistanceToNow(new Date(vote.timestamp))} ago
                        </div>
                      )}
                    </HStack>
                    <h2 className="px-0 py-1 overflow-hidden text-base text-black text-ellipsis">
                      <a href={`/proposals/${vote.proposal_id}`}>
                        {shortPropTitle(vote.proposalTitle, vote.proposal_id)}
                      </a>
                    </h2>
                    {vote.proposalType === "APPROVAL" && (
                      <ApprovalVoteContainer {...vote} />
                    )}
                    {(vote.proposalType === "STANDARD" ||
                      vote.proposalType === "OPTIMISTIC") && (
                      <StandardVoteContainer {...vote} />
                    )}
                  </VStack>
                  {vote.reason && <VoteReason reason={vote.reason} />}
                </div>
              </VoteDetailsContainer>
            )
        )}
      </InfiniteScroll>
    </VStack>
  );
}
