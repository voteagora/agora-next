import { fetchProposal } from "@/app/api/common/proposals/getProposals";
import { cleanString, truncateString } from "@/app/lib/utils/text";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import StandardProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/StandardProposalPage";
import React from "react";

export async function generateMetadata({ params }, parent) {
  const proposal = await fetchProposal(params.proposal_id);
  const title = truncateString(cleanString(proposal.markdowntitle), 40);
  const description = truncateString(cleanString(proposal.description), 80);

  const preview = `/api/images/og/proposal?title=${encodeURIComponent(
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

export default async function Page({ params: { proposal_id } }) {
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
