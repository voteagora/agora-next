export const dynamic = "force-dynamic"; // needed for app and e2e

import {
  fetchProposal,
  fetchProposalUnstableCache,
} from "@/app/api/common/proposals/getProposals";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { fetchVotableSupplyUnstableCache } from "@/app/api/common/votableSupply/getVotableSupply";
import { Vote } from "@/app/api/common/votes/vote";
import { cleanString, truncateString } from "@/app/lib/utils/text";
import {
  getProposalPageComponent,
  requiresSpecialHandling,
} from "@/components/Proposals/ProposalPage/registry";
import { ParsedProposalData } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";
import { calculateVoteMetadata } from "@/lib/voteUtils";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { fetchProposalFromArchive } from "@/lib/archiveUtils";
import { archiveToProposal } from "@/lib/proposals";
import { fetchProposalTaxFormMetadata } from "@/app/api/common/proposals/getProposalTaxFormMetadata";

export const maxDuration = 60;

async function loadProposal(
  proposalId: string,
  fetchLiveProposal: (proposalId: string) => Promise<Proposal>
): Promise<Proposal> {
  const { namespace, token, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposal-details")?.enabled;

  if (useArchive) {
    const [archiveProposal, taxFormMetadata] = await Promise.all([
      fetchProposalFromArchive(namespace, proposalId),
      fetchProposalTaxFormMetadata(proposalId),
    ]);

    if (archiveProposal) {
      const normalizedProposal = archiveToProposal(archiveProposal, {
        namespace,
        tokenDecimals: token.decimals ?? 18,
      });

      return {
        ...normalizedProposal,
        taxFormMetadata,
      };
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

  // Check for special handling (e.g., Copeland)
  const specialComponent = requiresSpecialHandling(loadedProposal);
  const RenderComponent =
    specialComponent ||
    getProposalPageComponent(loadedProposal, useArchiveForProposals);

  return (
    <div className="flex justify-between mt-12">
      <div>
        <RenderComponent proposal={loadedProposal} />
      </div>
    </div>
  );
}
