import AdminForm from "@/components/Admin/AdminForm";
import { getProposalTypes } from "../api/proposals/getProposals";
import { getVotableSupply } from "../api/votableSupply/getVotableSupply";

async function fetchProposalTypes() {
  "use server";

  return getProposalTypes();
}

async function fetchVotableSupply() {
  "use server";

  return getVotableSupply();
}

export default async function Page() {
  const proposalTypes = await fetchProposalTypes();
  const votableSupply = await fetchVotableSupply();

  return (
    <AdminForm votableSupply={votableSupply} proposalTypes={proposalTypes} />
  );
}
