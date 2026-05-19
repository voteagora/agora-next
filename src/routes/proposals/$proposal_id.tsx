/*
 * TanStack Start port of src/app/proposals/[proposal_id]/page.tsx.
 * URL: /proposals/:proposal_id
 */

import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import { cleanString, truncateString } from "@/app/lib/utils/text";
import { type ParsedProposalData } from "@/lib/proposalUtils";
import CopelandProposalPage from "@/components/Proposals/ProposalPage/CopelandProposalPage/CopelandProposalPage";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import StandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/StandardProposalPage";
import ArchiveStandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/ArchiveStandardProposalPage";
import HybridStandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/HybridStandardProposalPage";
import HybridApprovalProposalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/HybridApprovalProposalPage";
import HybridOptimisticProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/HybridOptimisticProposalPage";
import ArchiveOptimisticProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/ArchiveOptimisticProposalPage";
import ArchiveApprovalProposalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/ArchiveApprovalProposalPage";

const serverLoadProposal = createServerFn({ method: "GET" })
  .inputValidator((data: { proposalId: string }) => data)
  .handler(async ({ data }) => {
    const { ui, namespace, token } = Tenant.current();
    const useArchive = ui.toggle("use-archive-for-proposal-details")?.enabled;

    let proposal;
    if (useArchive) {
      const { fetchProposalFromArchive } = await import("@/lib/archiveUtils");
      const { fetchProposalTaxFormMetadata } = await import(
        "@/app/api/common/proposals/getProposalTaxFormMetadata"
      );
      const {
        isArchiveStandardProposal,
        isArchiveOptimisticProposal,
        isArchiveApprovalProposal,
        normalizeArchiveOptimisticProposal,
        normalizeArchiveApprovalProposal,
        normalizeArchiveStandardProposal,
      } = await import(
        "@/components/Proposals/Proposal/Archive/normalizeArchiveProposalDetail"
      );

      const [archiveResults, taxFormMetadata] = await Promise.all([
        fetchProposalFromArchive(namespace, data.proposalId),
        fetchProposalTaxFormMetadata(data.proposalId),
      ]);

      const archiveProposal = archiveResults ?? undefined;
      if (archiveProposal) {
        const normalizeOptions = {
          namespace,
          tokenDecimals: token.decimals ?? 18,
        };

        if (isArchiveOptimisticProposal(archiveProposal)) {
          proposal = {
            ...normalizeArchiveOptimisticProposal(
              archiveProposal,
              normalizeOptions
            ),
            taxFormMetadata,
          };
        } else if (isArchiveApprovalProposal(archiveProposal)) {
          proposal = {
            ...normalizeArchiveApprovalProposal(
              archiveProposal,
              normalizeOptions
            ),
            taxFormMetadata,
          };
        } else if (isArchiveStandardProposal(archiveProposal)) {
          proposal = {
            ...normalizeArchiveStandardProposal(
              archiveProposal,
              normalizeOptions
            ),
            taxFormMetadata,
          };
        }
      }
    } else {
      const { fetchProposal } = await import(
        "@/app/api/common/proposals/getProposals"
      );
      proposal = await fetchProposal(data.proposalId);
    }

    let votableSupply = "";
    if (proposal?.proposalType === "OPTIMISTIC" && !useArchive) {
      const { fetchVotableSupply } = await import(
        "@/app/api/common/votableSupply/getVotableSupply"
      );
      votableSupply = await fetchVotableSupply();
    }

    return {
      proposal,
      useArchiveForProposals: useArchive,
      votableSupply,
    } as any;
  });

export const Route = createFileRoute("/proposals/$proposal_id")({
  head: ({ loaderData }) => {
    const d = loaderData as
      | { metaTitle?: string; metaDescription?: string }
      | undefined;
    return {
      meta: [
        { title: d?.metaTitle ?? "Proposal" },
        { name: "description", content: d?.metaDescription ?? "" },
      ],
    };
  },
  loader: async ({ params }) => {
    const { proposal, useArchiveForProposals, votableSupply } =
      (await serverLoadProposal({
        data: { proposalId: params.proposal_id },
      })) as any;

    if (!proposal) {
      throw redirect({ to: "/proposals" });
    }

    // Redirect OFFCHAIN_STANDARD proposals to their onchain counterpart
    const offchainData =
      proposal.proposalType === "OFFCHAIN_STANDARD"
        ? (proposal.proposalData as ParsedProposalData["OFFCHAIN_STANDARD"]["kind"])
        : null;

    if (offchainData?.onchainProposalId) {
      throw redirect({
        to: `/proposals/${offchainData.onchainProposalId}` as string,
      });
    }

    const metaTitle = truncateString(cleanString(proposal.markdowntitle), 40);
    const metaDescription = truncateString(
      cleanString(proposal.description || ""),
      80
    );

    return {
      proposal,
      useArchiveForProposals,
      metaTitle,
      metaDescription,
      votableSupply,
    };
  },
  component: function ProposalPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loaderData = Route.useLoaderData() as any;
    if (!loaderData) return null;
    const { proposal, useArchiveForProposals, votableSupply } = loaderData;

    let RenderComponent:
      | React.ComponentType<{ proposal: typeof proposal }>
      | undefined;

    switch (proposal.proposalType) {
      case "STANDARD":
        RenderComponent = useArchiveForProposals
          ? ArchiveStandardProposalPage
          : StandardProposalPage;
        break;
      case "OFFCHAIN_STANDARD":
      case "HYBRID_STANDARD":
        RenderComponent = HybridStandardProposalPage;
        break;
      case "OPTIMISTIC":
        if (useArchiveForProposals) {
          RenderComponent = ArchiveOptimisticProposalPage;
        } else {
          return (
            <div className="flex justify-between mt-12">
              <div>
                <OPProposalOptimisticPage
                  proposal={proposal as never}
                  votableSupply={votableSupply}
                />
              </div>
            </div>
          );
        }
        break;
      case "OFFCHAIN_OPTIMISTIC":
      case "OFFCHAIN_OPTIMISTIC_TIERED":
      case "HYBRID_OPTIMISTIC_TIERED":
        RenderComponent = HybridOptimisticProposalPage;
        break;
      case "APPROVAL":
        RenderComponent = useArchiveForProposals
          ? ArchiveApprovalProposalPage
          : OPProposalApprovalPage;
        break;
      case "HYBRID_APPROVAL":
        RenderComponent = HybridApprovalProposalPage;
        break;
      case "SNAPSHOT":
        if (
          (proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"])
            ?.type === "copeland"
        ) {
          RenderComponent = CopelandProposalPage;
        }
        break;
      default:
        RenderComponent = StandardProposalPage;
    }

    return (
      <div className="flex justify-between mt-12">
        <div>
          {RenderComponent && <RenderComponent proposal={proposal as never} />}
        </div>
      </div>
    );
  },
});
