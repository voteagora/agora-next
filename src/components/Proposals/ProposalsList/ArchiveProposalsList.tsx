"use client";

import * as React from "react";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";
import Tenant from "@/lib/tenant/tenant";
import CreateProposalDraftButton from "./CreateProposalDraftButton";
import ProposalsPageInfoBanner from "../ProposalsPageInfoBanner";
import { useInfoBannerVisibility } from "@/hooks/useInfoBannerVisibility";

import { useAccount } from "wagmi";
import { ArchiveProposalRow } from "../Proposal/ArchiveProposalList";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { useSearchParams } from "next/navigation";
import { proposalsFilterOptions } from "@/lib/constants";
import { UpdatedButton } from "@/components/Button";
import { DaoSlug } from "@prisma/client";

function normalizeProposalKwargs(
  kwargs: unknown
): Record<string, unknown> | undefined {
  if (!kwargs) {
    return {};
  }

  if (typeof kwargs === "string") {
    try {
      return JSON.parse(kwargs.replace(/'/g, '"'));
    } catch {
      return {};
    }
  }

  if (typeof kwargs === "object") {
    return kwargs as Record<string, unknown>;
  }

  return {};
}

export default function ArchiveProposalsList({
  proposals,
  governanceCalendar,
}: {
  proposals: ArchiveListProposal[];
  governanceCalendar?: {
    title: string;
    endDate: string;
    reviewPeriod: boolean;
    votingPeriod: boolean;
  } | null;
}) {
  const { address } = useAccount();
  const { token } = Tenant.current();
  const searchParams = useSearchParams();
  const filter =
    searchParams?.get("filter") ?? proposalsFilterOptions.relevant.filter;
  const { ui, slug } = Tenant.current();

  let tenantSupportsProposalLifecycle =
    ui.toggle("proposal-lifecycle")?.enabled;

  if (slug === DaoSlug.OP) {
    const proposalCreators = [
      "0xe538f6f407937ffDEe9B2704F9096c31c64e63A8", // Op Gov Manager for Prod
      "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
      "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB", // Dev Wallet for testing on op-sepolia
      "0xb8CF6C0425FD799D617351C24fF35B493eD06Cb4", // Jonas's prod EOA
      "0x4a6894Dd556fab996f8D50b521f900CAEedC168e", // Jonas's test EOA
      "0xcC0B26236AFa80673b0859312a7eC16d2b72C1ea",
    ];

    tenantSupportsProposalLifecycle = proposalCreators.includes(address || "");
  }

  const filteredProposals = React.useMemo(() => {
    if (filter === proposalsFilterOptions.everything.filter) {
      return proposals.map((proposal) => ({
        ...proposal,
        kwargs: normalizeProposalKwargs(proposal.kwargs),
      }));
    }

    if (filter === proposalsFilterOptions.tempChecks.filter) {
      return proposals.filter((proposal) =>
        proposal.tags?.includes("tempcheck")
      );
    }

    return proposals
      .filter(
        (proposal) =>
          !proposal.cancel_event &&
          !proposal.delete_event &&
          proposal.lifecycle_stage !== "CANCELLED"
      )
      .map((proposal) => ({
        ...proposal,
        kwargs: normalizeProposalKwargs(proposal.kwargs),
      }));
  }, [filter, proposals]);

  const sortedProposals = React.useMemo(() => {
    return [...filteredProposals].sort((a, b) => {
      const aBlock = Number(a.start_blocktime) || 0;
      const bBlock = Number(b.start_blocktime) || 0;
      if (bBlock !== aBlock) {
        return bBlock - aBlock;
      }

      const aLogIndex = Number(a.log_index) || 0;
      const bLogIndex = Number(b.log_index) || 0;
      return bLogIndex - aLogIndex;
    });
  }, [filteredProposals]);

  const tokenDecimals = token?.decimals ?? 18;

  // Check if banner is configured and visible
  const bannerConfig = ui.toggle("proposals-page-info-banner");
  const isBannerEnabled = bannerConfig?.enabled && bannerConfig?.config;
  const isBannerVisible = useInfoBannerVisibility("proposals-page-info-banner");
  const isEASV2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;

  return (
    <div className="flex flex-col max-w-[76rem]">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
        <PageHeader headerText="All Proposals" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit items-center">
          <ProposalsFilter />
          {address ? (
            isEASV2Enabled && tenantSupportsProposalLifecycle ? (
              <UpdatedButton
                variant="rounded"
                type="primary"
                onClick={async () => {
                  window.location.href = `/create`;
                }}
              >
                Create proposal
              </UpdatedButton>
            ) : (
              <CreateProposalDraftButton address={address} />
            )
          ) : null}
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
      <div className="relative">
        <ProposalsPageInfoBanner />
        <div
          className={`flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden relative z-10 ${isBannerEnabled ? (isBannerVisible ? "-mt-4" : "mt-4") : ""}`}
        >
          <div>
            {sortedProposals.length === 0 ? (
              <div className="flex flex-row justify-center py-8 text-secondary">
                No proposals currently
              </div>
            ) : (
              <div>
                {sortedProposals.map((proposal) => (
                  <ArchiveProposalRow
                    key={proposal.id}
                    proposal={proposal}
                    tokenDecimals={tokenDecimals}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
