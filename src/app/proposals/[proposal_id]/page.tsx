export const dynamic = "force-dynamic"; // needed for app and e2e

import {
  fetchProposal,
  fetchProposalUnstableCache,
} from "@/app/api/common/proposals/getProposals";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { fetchVotableSupplyUnstableCache } from "@/app/api/common/votableSupply/getVotableSupply";
import { Vote } from "@/app/api/common/votes/vote";
import { cleanString, truncateString } from "@/app/lib/utils/text";
import CopelandProposalPage from "@/components/Proposals/ProposalPage/CopelandProposalPage/CopelandProposalPage";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import StandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/StandardProposalPage";
import ArchiveStandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/ArchiveStandardProposalPage";
import { ParsedProposalData } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";
import { calculateVoteMetadata } from "@/lib/voteUtils";
import { format } from "date-fns";
import React from "react";
import HybridStandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/HybridStandardProposalPage";
import HybridApprovalProposalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/HybridApprovalProposalPage";
import HybridOptimisticProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/HybridOptimisticProposalPage";
import { redirect } from "next/navigation";
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
    console.log("archiveResults", archiveResults);
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

// Share my vote metadata
async function generateVoterMetadata(
  proposal: Proposal,
  title: string,
  description: string,
  newVote?: Pick<
    Vote,
    "support" | "reason" | "weight" | "params" | "blockNumber" | "timestamp"
  >
) {
  const { namespace, contracts } = Tenant.current();
  const votableSupply = await fetchVotableSupplyUnstableCache();
  const latestBlock = await contracts.token.provider.getBlock("latest");
  const voteDateToUse = newVote?.timestamp
    ? format(new Date(Number(newVote.timestamp)), "MMM d, yyyy h:mm a")
    : null;

  const {
    support,
    blockNumber,
    timestamp,
    endsIn,
    forPercentage,
    againstPercentage,
    totalOptions,
    options,
  } = calculateVoteMetadata({
    proposal,
    votableSupply,
    newVote,
  });

  const stringifiedOptions = JSON.stringify(options);
  const preview = `/api/images/og/share-my-vote?namespace=${namespace.toUpperCase()}&supportType=${support}&blockNumber=${newVote?.blockNumber ?? blockNumber ?? latestBlock?.number}&voteDate=${voteDateToUse ?? timestamp}&endsIn=${endsIn}&forPercentage=${forPercentage}&againstPercentage=${againstPercentage}&proposalType=${proposal.proposalType}&options=${stringifiedOptions}&totalOptions=${totalOptions}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { proposal_id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const proposal = await loadProposal(
    params.proposal_id,
    fetchProposalUnstableCache
  );
  const title = truncateString(cleanString(proposal.markdowntitle), 40);
  const description = truncateString(
    cleanString(proposal.description || ""),
    80
  );

  const offchainProposalData =
    proposal.proposalType === "OFFCHAIN_STANDARD"
      ? (proposal.proposalData as ParsedProposalData["OFFCHAIN_STANDARD"]["kind"])
      : null;

  if (offchainProposalData?.onchainProposalId) {
    redirect(`/proposals/${offchainProposalData.onchainProposalId}`);
  }

  const support = searchParams.support as string;
  const reason = searchParams.reason as string;
  const weight = searchParams.weight as string;
  const voteParams = searchParams.params as string;
  const blockNumber = searchParams.blockNumber as string;
  const timestamp = searchParams.timestamp as string;

  if (support) {
    const voteParamsParsed = voteParams
      ? JSON.parse(decodeURIComponent(voteParams))
      : undefined;
    const newVote = {
      support,
      reason,
      weight,
      params: voteParamsParsed,
      blockNumber: blockNumber as any,
      timestamp: timestamp as any,
    };
    const awaitedMetadata = await generateVoterMetadata(
      proposal,
      title,
      description,
      newVote
    );
    return awaitedMetadata;
  }

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({
  params: { proposal_id },
}: {
  params: { proposal_id: string };
}) {
  const loadedProposal = await loadProposal(proposal_id, fetchProposal);

  const proposalData =
    loadedProposal.proposalType === "OFFCHAIN_STANDARD"
      ? (loadedProposal.proposalData as ParsedProposalData["OFFCHAIN_STANDARD"]["kind"])
      : null;

  if (proposalData?.onchainProposalId) {
    redirect(`/proposals/${proposalData.onchainProposalId}`);
  }

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
    <div className="flex justify-between mt-12">
      <div>
        {RenderComponent && <RenderComponent proposal={loadedProposal} />}
      </div>
    </div>
  );
}
