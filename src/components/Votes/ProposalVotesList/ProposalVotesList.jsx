"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./ProposalVotesList.module.scss";
import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import Loader from "@/components/Layout/Loader";

export default function ProposalVotesList({
  initialProposalVotes,
  fetchVotesForProposal,
  proposal_id,
}) {
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialProposalVotes] || []);
  const [meta, setMeta] = React.useState(initialProposalVotes.meta);

  const loadMore = async (page) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchVotesForProposal(proposal_id, page);
      const existingIds = new Set(proposalVotes.map((v) => v.transactionHash));
      const uniqueVotes = data.votes.filter(
        (v) => !existingIds.has(v.transactionHash)
      );
      setPages((prev) => [...prev, { ...data, votes: uniqueVotes }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const proposalVotes = pages.reduce((all, page) => all.concat(page.votes), []);

  return (
    <InfiniteScroll
      hasMore={meta.hasNextPage}
      pageStart={0}
      loadMore={loadMore}
      loader={<Loader />}
    >
      {proposalVotes.map((vote) => (
        <VStack key={vote.id} gap={1}>
          <VStack>
            <HStack justifyContent="justify-between">
              <HStack gap={1} alignItems="items-center">
                <HumanAddress address={vote.address} />
              </HStack>
              <HStack gap={1} alignItems="items-center">
                <TokenAmountDisplay
                  amount={vote.weight}
                  decimals={18}
                  currency="OP"
                />
                <p>{vote.reason}</p>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
      ))}
    </InfiniteScroll>
  );
}
