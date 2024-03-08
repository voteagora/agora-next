"use client";

import { useEffect, useRef, useState } from "react";

import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import Proposal from "../Proposal/Proposal";
import styles from "./proposalLists.module.scss";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";
import { useSearchParams } from "next/navigation";

export default function ProposalsList({
  initRelevantProposals,
  initAllProposals,
  fetchProposals,
  votableSupply,
  governanceCalendar,
}) {
  const filter = useSearchParams().get("filter") || "relevant";
  const fetching = useRef(false);
  const [pages, setPages] = useState([initRelevantProposals] || []);
  const [meta, setMeta] = useState(initRelevantProposals.meta);

  useEffect(() => {
    if (filter === "relevant") {
      setPages([initRelevantProposals]);
      setMeta(initRelevantProposals.meta);
    } else {
      setPages([initAllProposals]);
      setMeta(initAllProposals.meta);
    }
  }, [initRelevantProposals, initAllProposals, filter]);

  const loadMore = async () => {
    if (fetching.current || !meta.hasNextPage) return;
    fetching.current = true;
    const data = await fetchProposals(meta.currentPage + 1, filter);
    setPages((prev) => [...prev, { ...data, proposals: data.proposals }]);
    setMeta(data.meta);
    fetching.current = false;
  };

  const proposals = pages.flatMap((page) => page.proposals);

  return (
    <VStack className={styles.proposals_list_container}>
      {/* {address && <NonVotedProposalsList address={address} />} */}
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
        <PageHeader headerText="All Proposals" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit">
          <ProposalsFilter />
        </div>
      </div>

      {governanceCalendar && (
        <CurrentGovernanceStage
          title={governanceCalendar.title}
          endDate={governanceCalendar.endDate}
          reviewPeriod={governanceCalendar.reviewPeriod}
        />
      )}
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
