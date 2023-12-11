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
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";

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
        loader={
          <div className="flex justify-center mt-2" key={0}>
            <Image
              src="/images/blink.gif"
              alt="Blinking Agora Logo"
              width={50}
              height={20}
            />
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
    <VStack
      className={css`
        color: ${theme.colors.black};
        font-weight: ${theme.fontWeight.semibold};
        font-size: ${theme.fontSize.xs};
        margin-bottom: ${theme.spacing["5"]};
        border-radius: ${theme.borderRadius.md};
        border: 1px solid ${theme.colors.gray["eb"]};
      `}
    >
      <HStack
        alignItems="items-center"
        justifyContent="justify-between"
        className={css`
          padding: ${theme.spacing["3"]};
        `}
      >
        <div>
          <HumanAddress address={voterAddress} />
          {address === voterAddress && " (you)"}
          {" vote for"}
        </div>
        <div
          className={css`
            color: ${theme.colors.gray["4f"]};
          `}
        >
          <TokenAmountDisplay amount={weight} decimals={18} currency="OP" />
        </div>
      </HStack>
      <VStack
        className={css`
          margin-bottom: ${reason ? theme.spacing["1"] : "0"};
          color: ${theme.colors.gray[700]};
          gap: ${theme.spacing["1"]};
          font-weight: ${theme.fontWeight.medium};
          padding: 0 ${theme.spacing["3"]} ${theme.spacing["3"]}
            ${theme.spacing["3"]};
        `}
      >
        {params?.map((option, index) => (
          <p
            key={index}
            className={css`
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            `}
          >
            {++index}. {option}
          </p>
        ))}
        {support === "ABSTAIN" && "Abstain"}
      </VStack>
      {reason && (
        <div>
          <p
            className={css`
              margin-top: ${theme.spacing["1"]};
              color: ${theme.colors.gray[700]};
              font-weight: ${theme.fontWeight.medium};
              white-space: pre-wrap;
              padding: ${theme.spacing["3"]};
              border-top: 1px solid ${theme.colors.gray["300"]};
            `}
          >
            {reason}
          </p>
        </div>
      )}
    </VStack>
  );
}
