import DraftProposalChecklist from "@/components/ProposalLifecycle/DraftProposalChecklist";
import DraftProposalForm from "@/components/ProposalLifecycle/DraftProposalForm";
import React from "react";
import prisma from "@/app/lib/prisma";

const DraftProposalPage: React.FC = () => {
  async function createProposal() {
    "use server";

    console.log("Creating proposal");

    const prismaResponse = await prisma.proposal.create({
      data: {
        temp_check_link: "test",
        proposal_type: "social",
        title: "TEST PROPOSAL 1",
        description: "test",
        abstract: "test",
        audit_url: "test",
        update_ens_docs_status: true,
        post_on_discourse_status: true,
        dao: "ens",
        proposal_status: "draft",
        author_address: "0x123",
      },
    });

    console.log(prismaResponse);
  }
  return (
    <div className="flex flex-row gap-x-6 pt-9 items-start max-w-screen-xl mx-auto">
      <DraftProposalForm createProposal={createProposal} />
      <DraftProposalChecklist />
    </div>
  );
};

export default DraftProposalPage;
