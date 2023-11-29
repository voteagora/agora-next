"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroller";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { getHumanBlockTime } from "@/lib/blockTimes";
import styles from "./proposalLists.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import Link from "next/link";
import Image from "next/image";
import Proposal from "../Proposal/Proposal";
import Loader from "@/components/Layout/Loader";

export default function ProposalsList({ initialProposals, fetchProposals }) {
  const router = useRouter();
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialProposals] || []);
  const [meta, setMeta] = React.useState(initialProposals.meta);

  const loadMore = async (page) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchProposals(page);
      const existingIds = new Set(proposals.map((p) => p.id));
      const uniqueProposals = data.proposals.filter(
        (p) => !existingIds.has(p.id)
      );
      setPages((prev) => [...prev, { ...data, proposals: uniqueProposals }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const proposals = pages.reduce((all, page) => all.concat(page.proposals), []);

  return (
    <VStack className={styles.proposals_list_container}>
      {/* {address && <NonVotedProposalsList address={address} />} */}

      <PageHeader headerText="All Proposals" />

      <VStack className={styles.proposals_table_container}>
        <div className={styles.proposals_table}>
          <InfiniteScroll
            hasMore={meta.hasNextPage}
            pageStart={0}
            loadMore={loadMore}
            loader={<Loader />}
            element="main"
          >
            {proposals.map((proposal) => (
              <Proposal key={proposal.id} proposal={proposal} />
            ))}
          </InfiniteScroll>
        </div>
      </VStack>
    </VStack>
  );
}
