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
  //   const proposalTypes = [
  //     { id: 1, name: "test" },
  //     { id: 2, name: "test2" },
  //     { id: 3, name: "test3" },
  //   ];

  return (
    <DraftFormClient
      draftProposal={draftProposal}
      proposalTypes={proposalTypes}
    />
  );
};

export default DraftFormServer;
