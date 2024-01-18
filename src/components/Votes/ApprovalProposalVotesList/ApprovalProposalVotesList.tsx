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
    <div className={"overflow-y-scroll max-h-[calc(100vh-437px)]"}>
      {/* @ts-ignore */}
      <InfiniteScroll
        hasMore={meta.hasNextPage}
        pageStart={1}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div
            className="flex text-xs font-medium text-stone-500 justify-center pb-2"
            key={0}
          >
            Loading more votes...
          </div>
        }
      >
        <ul className="flex flex-col divide-y">
          {proposalVotes.map((vote) => (
            <li key={vote.transactionHash} className="p-4">
              <SingleVote vote={vote} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

function SingleVote({ vote }: { vote: Vote }) {
  const { address } = useAccount();
  const { address: voterAddress, params, support, reason, weight } = vote;

  return (
    <VStack className={""}>
      <HStack
        alignItems="items-center"
        justifyContent="justify-between"
        className={"mb-2 text-xs leading-4"}
      >
        <div className="text-black font-semibold">
          <HumanAddress address={voterAddress} />
          {address?.toLowerCase() === voterAddress && " (you)"}
          {" voted for"}
        </div>
        <div className={"font-semibold text-gray-700"}>
          <TokenAmountDisplay amount={weight} decimals={18} currency="OP" />
        </div>
      </HStack>
      <VStack className={"text-xs leading-4 mb-2"}>
        {params?.map((option: string, index: number) => (
          <p
            key={index}
            className={
              "whitespace-nowrap text-ellipsis overflow-hidden pl-3 border-l border-gray-eo text-gray-4f font-medium"
            }
          >
            {++index}. {option}
          </p>
        ))}
        {support === "ABSTAIN" && (
          <p className="pl-3 border-l border-gray-eo text-gray-4f font-medium">
            {"Abstain"}
          </p>
        )}
      </VStack>
      {reason && (
        <div>
          <p className={"text-gray-4f font-medium text-xs leading-4"}>
            {reason}
          </p>
        </div>
      )}
    </VStack>
  );
}
