import DraftFormClient from "./DraftFormClient";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { DraftProposal } from "../../../types";

async function getProposalTypes() {
  "use server";
  try {
    const proposalTypes = await fetchProposalTypes();
    return proposalTypes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

const DraftFormServer = async ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const proposalTypes = await getProposalTypes();

  return (
    <DraftFormClient
      draftProposal={draftProposal}
      proposalTypes={proposalTypes}
    />
  );
};

export default DraftFormServer;
