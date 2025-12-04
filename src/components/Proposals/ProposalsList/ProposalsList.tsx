"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { BookOpen } from "lucide-react";

import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import InfiniteScroll from "react-infinite-scroller";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";
import { useSearchParams } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import CreateProposalDraftButton from "./CreateProposalDraftButton";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { Proposal as ProposalType } from "@/app/api/common/proposals/proposal";
import Proposal from "../Proposal/Proposal";
import { DaoSlug } from "@prisma/client";

import { EducationBanner } from "@/components/shared/EducationBanner";

export default function ProposalsList({
  initRelevantProposals,
  initAllProposals,
  fetchProposals,
  votableSupply,
  governanceCalendar,
}: {
  initRelevantProposals: PaginatedResult<ProposalType[]>;
  initAllProposals: PaginatedResult<ProposalType[]>;
  fetchProposals: (
    pagination: PaginationParams,
    filter: string
  ) => Promise<PaginatedResult<ProposalType[]>>;
  votableSupply: string;
  governanceCalendar?: {
    title: string;
    endDate: string;
    reviewPeriod: boolean;
    votingPeriod: boolean;
  } | null;
}) {
  const { address } = useAccount();
  const { ui, slug } = Tenant.current();
  let tenantSupportsProposalLifecycle =
    ui.toggle("proposal-lifecycle")?.enabled;

  if (slug === DaoSlug.OP) {
    const proposalCreators = [
      "0xe538f6f407937ffDEe9B2704F9096c31c64e63A8", // Op Gov Manager for Prod
      "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
      "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB", // Dev Wallet for testing on op-sepolia
    ];

    tenantSupportsProposalLifecycle = proposalCreators.includes(address || "");
  }

  const filter = useSearchParams()?.get("filter") || "relevant";
  const fetching = useRef(false);
  const [pages, setPages] = useState([initRelevantProposals]);
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
    if (fetching.current || !meta.has_next) return;
    fetching.current = true;
    const data = await fetchProposals(
      { limit: 10, offset: meta.next_offset },
      filter
    );
    setPages((prev) => [...prev, { ...data, proposals: data.data }]);
    setMeta(data.meta);
    fetching.current = false;
  };

  const proposals = pages.flatMap((page) => page.data);

  return (
    <div className="flex flex-col max-w-[76rem]">
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
          votingPeriod={governanceCalendar.votingPeriod}
        />
      )}
      <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
        <EducationBanner
          icon={<BookOpen className="h-5 w-5" />}
          message="Learn about the voting process"
          href="/info#voting-process"
          storageKey="proposals-banner-dismissed"
        />
        <div>
          {proposals.length === 0 ? (
            <div className="flex flex-row justify-center py-8 text-secondary">
              No proposals currently
            </div>
          ) : (
            <InfiniteScroll
              hasMore={meta.has_next}
              pageStart={0}
              loadMore={loadMore}
              loader={
                <div key={0}>
                  <div
                    className="flex flex-row gl_loader justify-center py-6 text-sm text-secondary"
                    key="loader"
                  >
                    Loading...
                  </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
