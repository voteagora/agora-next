import AdminForm from "@/components/Admin/AdminForm";
import { getVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchProposalTypes } from "@/app/admin/actions";

async function fetchVotableSupply() {
  "use server";
  return getVotableSupply();
}

export default async function Page() {
  const votableSupply = await fetchVotableSupply();
  const proposalTypes = await fetchProposalTypes();

  return (
    <AdminForm votableSupply={votableSupply} proposalTypes={proposalTypes} />
  );
}
