"use client";

import * as React from "react";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";
import { useSearchParams } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import CreateProposalDraftButton from "./CreateProposalDraftButton";
import ArchiveStandardProposal from "../Proposal/ArchiveStandardProposal";
import { useAccount } from "wagmi";
import { DaoSlug } from "@prisma/client";

type ArchiveProposal = {
  id: string;
  proposer: string;
  block_number?: string;
  start_block: number | string;
  end_block?: number | string | null;
  start_blocktime?: number;
  end_blocktime?: number;
  proposal_type?: number;
  voting_module_name?: string;
  totals?: any;
  queue_event?: any;
  execute_event?: any;
  cancel_event?: any;
  description?: string;
  title?: string;
};

export default function ArchiveProposalsList({
  proposals,
  governanceCalendar,
}: {
  proposals: ArchiveProposal[];
  governanceCalendar?: {
    title: string;
    endDate: string;
    reviewPeriod: boolean;
    votingPeriod: boolean;
  } | null;
}) {
  const { address } = useAccount();
  const { ui, slug } = Tenant.current();
  const filter = useSearchParams()?.get("filter") || "relevant";
  let tenantSupportsProposalLifecycle =
    ui.toggle("proposal-lifecycle")?.enabled;

  if (slug === DaoSlug.OP) {
    const proposalCreators = [
      "0xe538f6f407937ffDEe9B2704F9096c31c64e63A8",
      "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
      "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB",
    ];
    tenantSupportsProposalLifecycle = proposalCreators.includes(address || "");
  }

  const sortedProposals = React.useMemo(() => {
    return [...proposals].sort((a, b) => {
      const aBlock = Number(a.start_block) || 0;
      const bBlock = Number(b.start_block) || 0;
      return bBlock - aBlock;
    });
  }, [proposals]);

  return (
    <div className="flex flex-col max-w-[76rem]">
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
        <div>
          {sortedProposals.length === 0 ? (
            <div className="flex flex-row justify-center py-8 text-secondary">
              No proposals currently
            </div>
          ) : (
            <div>
              {sortedProposals.map((proposal) => {
                // Only render standard proposals
                if (
                  proposal.proposal_type === 0 &&
                  proposal.voting_module_name === "standard"
                ) {
                  return (
                    <ArchiveStandardProposal
                      key={`${proposal.id}`}
                      proposal={proposal}
                    />
                  );
                }
                // Don't render non-standard proposals
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
