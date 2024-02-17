"use client";

import { useEffect, useRef, useState } from "react";

import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import Proposal from "../Proposal/Proposal";
import styles from "./proposalLists.module.scss";

export default function ProposalsList({
  initialProposals,
  fetchProposals,
  votableSupply,
}) {
  const fetching = useRef(false);
  const [pages, setPages] = useState([initialProposals] || []);
  const [meta, setMeta] = useState(initialProposals.meta);

  useEffect(() => {
    setPages([initialProposals]);
    setMeta(initialProposals.meta);
  }, [initialProposals]);

  const loadMore = async () => {
    if (fetching.current || !meta.hasNextPage) return;

    fetching.current = true;

    const data = await fetchProposals(meta.currentPage + 1);
    const uniqueProposals = data.proposals.filter(
      (p) => !proposals.some((existing) => existing.id === p.id)
    );
    setPages((prev) => [...prev, { ...data, proposals: uniqueProposals }]);
    setMeta(data.meta);
    fetching.current = false;
  };

  const proposals = pages.flatMap((page) => page.proposals);

  return (
    <VStack className={styles.proposals_list_container}>
      {/* {address && <NonVotedProposalsList address={address} />} */}

      <div className="flex flex-col md:flex-row justify-between items-baseline gap-2">
        <PageHeader headerText="All Proposals" />
        <div className="flex flex-col md:flex-row justify-between gap-4 w-full md:w-fit">
          <ProposalsFilter />
        </div>
      </div>

      <VStack className={styles.proposals_table_container}>
        <div className={styles.proposals_table}>
          <InfiniteScroll
            hasMore={meta.hasNextPage}
            pageStart={0}
            loadMore={loadMore}
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
          >
            {proposals.map((proposal) => (
              <Proposal
                key={`${proposal.id}_${proposal.status}`}
                proposal={proposal}
                votableSupply={votableSupply}
              />
            ))}
          </InfiniteScroll>
        </div>
      </VStack>
    </VStack>
  );
}
