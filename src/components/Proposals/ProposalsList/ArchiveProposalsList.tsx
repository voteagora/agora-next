"use client";

import * as React from "react";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";
import Tenant from "@/lib/tenant/tenant";
import CreateProposalDraftButton from "./CreateProposalDraftButton";

import { useAccount } from "wagmi";
import ArchiveProposalRow from "../Proposal/Archive/ArchiveProposalRow";
import { normalizeArchiveProposals } from "../Proposal/Archive/normalizeArchiveProposal";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { useSearchParams } from "next/navigation";
import { proposalsFilterOptions } from "@/lib/constants";
import { UpdatedButton } from "@/components/Button";

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
  const { token, namespace } = Tenant.current();
  const searchParams = useSearchParams();
  const filter =
    searchParams?.get("filter") ?? proposalsFilterOptions.relevant.filter;

  const filteredProposals = React.useMemo(() => {
    if (filter === proposalsFilterOptions.everything.filter) {
      return proposals;
    }

    if (filter === proposalsFilterOptions.tempChecks.filter) {
      return proposals.filter((proposal) =>
        proposal.tags?.includes("tempcheck")
      );
    }

    return proposals.filter(
      (proposal) =>
        !proposal.cancel_event &&
        !proposal.delete_event &&
        proposal.lifecycle_stage !== "CANCELLED"
    );
  }, [filter, proposals]);

  const sortedProposals = React.useMemo(() => {
    return [...filteredProposals].sort((a, b) => {
      const aBlock = Number(a.start_blocktime) || 0;
      const bBlock = Number(b.start_blocktime) || 0;
      return bBlock - aBlock;
    });
  }, [filteredProposals]);

  const normalizedProposals = React.useMemo(
    () =>
      normalizeArchiveProposals(sortedProposals, {
        namespace,
        tokenDecimals: token?.decimals ?? 18,
      }),
    [sortedProposals, namespace, token?.decimals]
  );

  return (
    <div className="flex flex-col max-w-[76rem]">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
        <PageHeader headerText="All Proposals" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit items-center">
          <ProposalsFilter />
          {address && (
            <UpdatedButton
              variant="rounded"
              type="primary"
              onClick={async () => {
                window.location.href = `/create`;
              }}
            >
              Create proposal
            </UpdatedButton>
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
        <div>
          {normalizedProposals.length === 0 ? (
            <div className="flex flex-row justify-center py-8 text-secondary">
              No proposals currently
            </div>
          ) : (
            <div>
              {normalizedProposals.map((proposal) => (
                <ArchiveProposalRow key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
