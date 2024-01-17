import React from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import OPProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import { getProposal } from "@/app/api/proposals/getProposals";

async function fetchProposal(proposal_id) {
  "use server";

  return {
    proposal: await getProposal({ proposal_id }),
  };
}

export async function generateMetadata({ params }, parent) {
  const { proposal } = await fetchProposal(params.proposal_id);

  const cleanText = (text) => {
    return text
      .replace(/#{1,6}\s/g, "") // Removes Markdown headings
      .replace(/\n/g, " "); // Replaces newlines with space
  };

  const cleanTitle = cleanText(proposal.markdowntitle);
  const truncatedTitle =
    cleanTitle.length > 60 ? cleanTitle.substring(0, 57) + "..." : cleanTitle;

  const cleanDescription = cleanText(proposal.description);
  const truncatedDescription =
    cleanDescription.length > 160
      ? cleanDescription.substring(0, 157) + "..."
      : cleanDescription;

  return {
    title: `Agora - OP Proposal: ${truncatedTitle}`,
    description: truncatedDescription,
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
