export const dynamic = "force-dynamic";

import {
  fetchProposal,
} from "@/app/api/common/proposals/getProposals";
import CopelandProposalPage from "@/components/Proposals/ProposalPage/CopelandProposalPage/CopelandProposalPage";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import StandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/StandardProposalPage";
import ArchiveStandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/ArchiveStandardProposalPage";
import { ParsedProposalData } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";
import React from "react";
import HybridStandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/HybridStandardProposalPage";
import HybridApprovalProposalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/HybridApprovalProposalPage";
import HybridOptimisticProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/HybridOptimisticProposalPage";
import { fetchProposalFromArchive } from "@/lib/archiveUtils";
import {
  isArchiveStandardProposal,
  isArchiveOptimisticProposal,
  isArchiveApprovalProposal,
  normalizeArchiveOptimisticProposal,
  normalizeArchiveApprovalProposal,
  normalizeArchiveStandardProposal,
} from "@/components/Proposals/Proposal/Archive/normalizeArchiveProposalDetail";
import ArchiveOptimisticProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/ArchiveOptimisticProposalPage";
import ArchiveApprovalProposalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/ArchiveApprovalProposalPage";
import { fetchProposalTaxFormMetadata } from "@/app/api/common/proposals/getProposalTaxFormMetadata";
import { Proposal } from "@/app/api/common/proposals/proposal";

export const maxDuration = 60;

async function loadProposal(
  proposalId: string,
  fetchLiveProposal: (proposalId: string) => Promise<Proposal>
): Promise<Proposal> {
  const { namespace, token, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposal-details")?.enabled;

  if (useArchive) {
    const [archiveResults, taxFormMetadata] = await Promise.all([
      fetchProposalFromArchive(namespace, proposalId),
      fetchProposalTaxFormMetadata(proposalId),
    ]);

    const archiveProposal = archiveResults ? archiveResults : undefined;
    if (archiveProposal) {
      const normalizeOptions = {
        namespace,
        tokenDecimals: token.decimals ?? 18,
      };

      if (isArchiveOptimisticProposal(archiveProposal)) {
        const formatedProposal = normalizeArchiveOptimisticProposal(
          archiveProposal,
          normalizeOptions
        );
        return {
          ...formatedProposal,
          taxFormMetadata,
        };
      }

      if (isArchiveApprovalProposal(archiveProposal)) {
        const formatedProposal = normalizeArchiveApprovalProposal(
          archiveProposal,
          normalizeOptions
        );
        return {
          ...formatedProposal,
          taxFormMetadata,
        };
      }

      if (isArchiveStandardProposal(archiveProposal)) {
        const formatedProposal = normalizeArchiveStandardProposal(
          archiveProposal,
          normalizeOptions
        );
        return {
          ...formatedProposal,
          taxFormMetadata,
        };
      }
    }

    throw new Error("Proposal not found in archive");
  }

  return await fetchLiveProposal(proposalId);
}

export default async function TestPage({
  params: { proposal_id },
}: {
  params: { proposal_id: string };
}) {
  const loadedProposal = await loadProposal(proposal_id, fetchProposal);

  const { ui } = Tenant.current();
  const useArchiveForProposals = ui.toggle(
    "use-archive-for-proposal-details"
  )?.enabled;

  let RenderComponent;
  switch (loadedProposal.proposalType) {
    case "STANDARD":
      if (useArchiveForProposals) {
        RenderComponent = ArchiveStandardProposalPage;
      } else {
        RenderComponent = StandardProposalPage;
      }
      break;

    case "OFFCHAIN_STANDARD":
    case "HYBRID_STANDARD":
      RenderComponent = HybridStandardProposalPage;
      break;

    case "OPTIMISTIC":
      if (useArchiveForProposals) {
        RenderComponent = ArchiveOptimisticProposalPage;
      } else {
        RenderComponent = OPProposalOptimisticPage;
      }
      break;
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
    case "HYBRID_OPTIMISTIC_TIERED":
      RenderComponent = HybridOptimisticProposalPage;
      break;
    case "APPROVAL":
      if (useArchiveForProposals) {
        RenderComponent = ArchiveApprovalProposalPage;
      } else {
        RenderComponent = OPProposalApprovalPage;
      }
      break;
    case "HYBRID_APPROVAL":
      RenderComponent = HybridApprovalProposalPage;
      break;
    case "SNAPSHOT":
      if (
        (loadedProposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"])
          ?.type === "copeland"
      ) {
        RenderComponent = CopelandProposalPage;
      }
      break;
    default:
      // Default to standard proposal page
      RenderComponent = StandardProposalPage;
  }

  return (
    <div className="flex flex-col gap-24 mt-12 pb-24">
      <div>
        <h2 className="text-2xl font-bold mb-4">Layout 1</h2>
        {RenderComponent && <RenderComponent proposal={loadedProposal} />}
      </div>
      <div className="border-t-4 border-dashed border-gray-300 pt-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Layout 2 (Comparison Clone)</h2>
        {RenderComponent && <RenderComponent proposal={loadedProposal} />}
      </div>
    </div>
  );
}
