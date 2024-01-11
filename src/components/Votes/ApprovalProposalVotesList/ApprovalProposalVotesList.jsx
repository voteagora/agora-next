"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./approvalProposalVotesList.module.scss";
import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import Image from "next/image";
import VoteText from "../VoteText/VoteText";
import { useAccount } from "wagmi";

export default function ApprovalProposalVotesList({
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
        {proposalVotes.map((vote, i) => (
          <SingleVote key={i} vote={vote} />
        ))}
      </InfiniteScroll>
    </div>
  );
}

function SingleVote({ vote }) {
  const { address } = useAccount();
  const { address: voterAddress, params, support, reason, weight } = vote;

  return (
    <VStack className={styles.single_vote}>
      <HStack
        alignItems="items-center"
        justifyContent="justify-between"
        className={styles.single_vote__header}
      >
        <div>
          <HumanAddress address={voterAddress} />
          {address === voterAddress && " (you)"}
          {" vote for"}
        </div>
        <div className={styles.single_vote__amount}>
          <TokenAmountDisplay amount={weight} decimals={18} currency="OP" />
        </div>
      </HStack>
      <VStack className={styles.single_vote__content}>
        {params?.map((option, index) => (
          <p
            key={index}
            className={"whitespace-nowrap text-ellipsis overflow-hidden"}
          >
            {++index}. {option}
          </p>
        ))}
        {support === "ABSTAIN" && "Abstain"}
      </VStack>
      {reason && (
        <div>
          <p className={styles.single_vote__reason}>{reason}</p>
        </div>
      )}
    </VStack>
  );
}
