"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import Proposal from "../Proposal/Proposal";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";
import { useSearchParams } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import CreateProposalDraftButton from "./CreateProposalDraftButton";

export default function ProposalsList({
  initRelevantProposals,
  initAllProposals,
  fetchProposals,
  votableSupply,
  governanceCalendar,
}) {
  const { address } = useAccount();
  const { ui } = Tenant.current();
  const tenantSupportsProposalLifecycle = ui.toggle("proposal-lifecycle");
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
    <VStack className="max-w-[76rem]">
      {/* {address && <NonVotedProposalsList address={address} />} */}
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
        <PageHeader headerText="All Proposals" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit items-center">
          <ProposalsFilter />
          {tenantSupportsProposalLifecycle && address && (
            <CreateProposalDraftButton address={address} />
          )}
        </div>
      </div>

      {governanceCalendar && (
        <CurrentGovernanceStage
          title={governanceCalendar.title}
          endDate={governanceCalendar.endDate}
          reviewPeriod={governanceCalendar.reviewPeriod}
        />
      )}
      <VStack className="bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
        <div>
          <InfiniteScroll
            hasMore={meta.hasNextPage}
            pageStart={0}
            loadMore={loadMore}
            loader={
              <div key={0}>
                <HStack
                  key="loader"
                  className="gl_loader justify-center py-6 text-sm text-secondary"
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
