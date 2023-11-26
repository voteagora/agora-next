"use client";

import * as React from "react";
import { HStack, VStack } from "../../Layout/Stack";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import { colorForSupportType } from "@/lib/voteUtils";
import { formatNumber, pluralizeVote } from "@/lib/tokenUtils";
import { shortAddress } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroller";
import Image from "next/image";
import VoteDetailsContainer from "./DelegateVotesDetailsContainer";
import VoteReason from "./DelegateVotesReason";
import StandardVoteContainer from "./StandardVoteContainer";
import ApprovalVoteContainer from "./ApprovalVoteContainer";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

export default function DelegateVotes({ initialVotes, fetchDelegateVotes }) {
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialVotes]);
  const [meta, setMeta] = React.useState(initialVotes.meta);

  const loadMore = async (page) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegateVotes(page);
      const existingIds = new Set(delegateVotes.map((d) => d.transactionHash));
      const uniqueVotes = data.votes.filter(
        (d) => !existingIds.has(d.transactionHash)
      );
      setPages((prev) => [...prev, { ...data, votes: uniqueVotes }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const delegateVotes = pages.reduce((all, page) => all.concat(page.votes), []);

  return (
    <VStack gap="4">
      <InfiniteScroll
        hasMore={meta.hasNextPage}
        pageStart={0}
        loadMore={loadMore}
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
      >
        {delegateVotes.map(
          (vote) =>
            vote && (
              <VoteDetailsContainer key={vote.transactionHash}>
                <div
                  className={css`
                    display: grid;
                    overflow-y: hidden;
                    grid-template-columns: 1fr 1px 1fr;

                    @media (max-width: ${theme.maxWidth["2xl"]}) {
                      grid-template-rows: 1fr;
                      grid-template-columns: none;
                      overflow-y: scroll;
                    }
                  `}
                >
                  <VStack
                    className={css`
                      padding: ${theme.spacing["4"]} ${theme.spacing["6"]};
                    `}
                  >
                    <HStack
                      gap="1"
                      className={css`
                        font-size: ${theme.fontSize.xs};
                        font-weight: ${theme.fontWeight.medium};
                        color: #66676b;
                      `}
                    >
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
                    <h2
                      className={css`
                        font-size: ${theme.fontSize.base};
                        padding: ${theme.spacing[1]} 0;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      `}
                    >
                      <a href={`/proposals/${vote.proposal_id}`}>
                        {shortPropTitle(vote.proposalTitle, vote.proposal_id)}
                      </a>
                    </h2>
                    {vote.proposalType === "APPROVAL" && (
                      <ApprovalVoteContainer {...vote} />
                    )}
                    {vote.proposalType === "STANDARD" && (
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
