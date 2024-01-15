"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./proposalVotesList.module.scss";
import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import Image from "next/image";
import VoteText from "../VoteText/VoteText";
import VoterHoverCard from "../VoterHoverCard";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function ProposalVotesList({
  initialProposalVotes,
  fetchVotesForProposal,
  fetchDelegate,
  fetchDelegateStatement,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  fetchDirectDelegatee,
  getProxyAddress,
  proposal_id,
}) {
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialProposalVotes] || []);
  const [meta, setMeta] = React.useState(initialProposalVotes.meta);

  const loadMore = async (page) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchVotesForProposal(proposal_id, page);
      console.log("DATA");
      console.log(data);
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
  const { isAdvancedUser } = useIsAdvancedUser();

  return (
    <div className={styles.vote_container}>
      <InfiniteScroll
        hasMore={meta.hasNextPage}
        pageStart={0}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div className="flex text-xs font-medium text-stone-500" key={0}>
            Loading more votes...
          </div>
        }
      >
        {proposalVotes.map((vote) => (
          <VStack
            key={vote.transactionHash}
            gap={4}
            className={styles.vote_row}
          >
            <VStack>
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger>
                  <HStack
                    justifyContent="justify-between"
                    className={styles.voter}
                  >
                    <HStack gap={1} alignItems="items-center">
                      <HumanAddress address={vote.address} />
                      <VoteText support={vote.support} />
                    </HStack>
                    <HStack
                      alignItems="items-center"
                      className={styles.vote_weight}
                    >
                      <TokenAmountDisplay
                        amount={vote.weight}
                        decimals={18}
                        currency="OP"
                      />
                    </HStack>
                  </HStack>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-full shadow"
                  side="left"
                  sideOffset="3"
                >
                  <VoterHoverCard
                    address={vote.address}
                    fetchDelegate={fetchDelegate}
                    fetchDelegateStatement={fetchDelegateStatement}
                    fetchBalanceForDirectDelegation={
                      fetchBalanceForDirectDelegation
                    }
                    fetchVotingPowerForSubdelegation={
                      fetchVotingPowerForSubdelegation
                    }
                    checkIfDelegatingToProxy={checkIfDelegatingToProxy}
                    fetchCurrentDelegatees={fetchCurrentDelegatees}
                    fetchDirectDelegatee={fetchDirectDelegatee}
                    getProxyAddress={getProxyAddress}
                    isAdvancedUser={isAdvancedUser}
                  />
                </HoverCardContent>
              </HoverCard>
            </VStack>
            <pre className={styles.vote_reason}>{vote.reason}</pre>
          </VStack>
        ))}
      </InfiniteScroll>
    </div>
  );
}
