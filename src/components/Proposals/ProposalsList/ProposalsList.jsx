"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./proposalLists.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import Proposal from "../Proposal/Proposal";
import Loader from "@/components/Layout/Loader";

export default function ProposalsList({
  initialProposals,
  fetchProposals,
  votableSupply,
}) {
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
