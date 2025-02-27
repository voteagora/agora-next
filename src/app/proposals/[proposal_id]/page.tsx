import {
  fetchProposal,
  fetchProposalUnstableCache,
} from "@/app/api/common/proposals/getProposals";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { fetchVotableSupplyUnstableCache } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchVotesForProposalAndDelegateUnstableCache } from "@/app/api/common/votes/getVotes";
import { Vote } from "@/app/api/common/votes/vote";
import { cleanString, truncateString } from "@/app/lib/utils/text";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import StandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/StandardProposalPage";
import Tenant from "@/lib/tenant/tenant";
import { calculateVoteMetadata } from "@/lib/voteUtils";
import React from "react";

export const dynamic = "force-dynamic";

// Share my vote metadata
async function generateVoterMetadata(
  proposal: Proposal,
  voter: string,
  title: string,
  description: string,
  newVote?: Pick<Vote, "support" | "reason" | "weight" | "params">
) {
  const { namespace, contracts } = Tenant.current();
  const votes = await fetchVotesForProposalAndDelegateUnstableCache({
    proposalId: proposal.id,
    address: voter,
  });
  const votableSupply = await fetchVotableSupplyUnstableCache();
  const latestBlock = await contracts.token.provider.getBlock("latest");

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
    votes,
    votableSupply,
    newVote,
  });

  const stringifiedOptions = JSON.stringify(options);
  const preview = `/api/images/og/share-my-vote?namespace=${namespace.toUpperCase()}&supportType=${support}&blockNumber=${blockNumber ?? latestBlock?.number}&voteDate=${timestamp}&endsIn=${endsIn}&forPercentage=${forPercentage}&againstPercentage=${againstPercentage}&proposalType=${proposal.proposalType}&options=${stringifiedOptions}&totalOptions=${totalOptions}`;

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
  const proposal = await fetchProposalUnstableCache(params.proposal_id);
  const title = truncateString(cleanString(proposal.markdowntitle), 40);
  const description = truncateString(
    cleanString(proposal.description || ""),
    80
  );

  const voteDataParam = searchParams.v as string;

  let voter, newVoteParsed;

  if (voteDataParam) {
    try {
      const voteData = JSON.parse(decodeURIComponent(voteDataParam));

      // Convert the simplified format back to the full format
      newVoteParsed = {
        support: voteData.s, // support
        reason: voteData.r, // reason
        params: voteData.p || [], // params
        weight: voteData.w || "0", // weight
      };

      voter = voteData.a;
    } catch (e) {
      console.error("Failed to parse vote data parameter:", e);
    }
  }

  if (voter) {
    return generateVoterMetadata(
      proposal,
      voter,
      title,
      description,
      newVoteParsed
    );
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
  const proposal = await fetchProposal(proposal_id);

  let RenderComponent;
  switch (proposal.proposalType) {
    case "STANDARD":
      RenderComponent = StandardProposalPage;
      break;

    case "OPTIMISTIC":
      RenderComponent = OPProposalOptimisticPage;
      break;
    case "APPROVAL":
      RenderComponent = OPProposalApprovalPage;
      break;
    default:
      // Default to standard proposal page
      RenderComponent = StandardProposalPage;
  }

  return (
    <div className="flex justify-between mt-12">
      <div>{RenderComponent && <RenderComponent proposal={proposal} />}</div>
    </div>
  );
}
