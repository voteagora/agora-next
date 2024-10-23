import DraftProposalListClient from "./DraftProposalListClient";
import { fetchDraftProposals as apiFetchDraftProposals } from "@/app/api/common/proposals/getProposals";

const fetchDraftProposals = async (address: `0x${string}`) => {
  "use server";
  return apiFetchDraftProposals(address);
};

const DraftProposalList = () => {
  return <DraftProposalListClient fetchDraftProposals={fetchDraftProposals} />;
};

export default DraftProposalList;
