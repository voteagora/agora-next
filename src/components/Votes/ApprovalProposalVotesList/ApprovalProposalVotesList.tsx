"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./approvalProposalVotesList.module.scss";
import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import Image from "next/image";
import { useAccount } from "wagmi";
import { Vote } from "@/app/api/votes/vote";

type Props = {
  initialProposalVotes: {
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  };
  fetchVotesForProposal: (
    proposal_id: string,
    page?: number
  ) => Promise<{
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  }>;
  proposal_id: string;
};

export default function ApprovalProposalVotesList({
  initialProposalVotes,
  fetchVotesForProposal,
  proposal_id,
}: Props) {
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialProposalVotes] || []);
  const [meta, setMeta] = React.useState(initialProposalVotes.meta);

  const proposalVotes = pages.reduce(
    (all: Vote[], page) => all.concat(page.votes),
    []
  );

  const loadMore = async (page: number) => {
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

  return (
    <div className={styles.vote_container}>
      {/* @ts-ignore */}
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
          <SingleVote key={vote.transactionHash} vote={vote} />
        ))}
      </InfiniteScroll>
    </div>
  );
}

function SingleVote({ vote }: { vote: Vote }) {
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
        {params?.map((option: string, index: number) => (
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
