import React from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import OPProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import { getProposal } from "@/app/api/proposals/getProposals";
import { cleanString, truncateString } from "@/app/lib/utils/text";

async function fetchProposal(proposal_id) {
  "use server";

  return {
    proposal: await getProposal({ proposal_id }),
  };
}

export async function generateMetadata({ params }, parent) {
  const { proposal } = await fetchProposal(params.proposal_id);


  const cleanTitle = cleanString(proposal.markdowntitle);
  const cleanDescription = cleanString(proposal.description);
  const truncatedTitle =    truncateString(cleanTitle, 60);
  const truncatedDescription = truncateString(cleanDescription,160);
  const title = `Agora - OP Proposal: ${truncatedTitle}`
  const preview = `/api/images/og/proposal?title=${encodeURIComponent(truncatedTitle)}&description=${encodeURIComponent(truncatedDescription)}`

  return {
    title: title,
    description: truncatedDescription,
    openGraph: {
      images: [preview],
    },
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: preview,
    },
  };
}

export default async function Page({ params: { proposal_id } }) {
  const { proposal } = await fetchProposal(proposal_id);

  let RenderComponent;
  switch (proposal.proposalType) {
    case "STANDARD":
      RenderComponent = OPProposalPage;
      break;
    case "OPTIMISTIC":
      RenderComponent = OPProposalOptimisticPage;
      break;
    case "APPROVAL":
      RenderComponent = OPProposalApprovalPage;
      break;
    default:
      // TODO: Fix this but We shouldn't get here
      RenderComponent = null;
  }

  return (
    <HStack justifyContent="justify-between" className="mt-12">
      <div>{RenderComponent && <RenderComponent proposal={proposal} />}</div>
      <VStack gap={6}></VStack>
    </HStack>
  );
}
