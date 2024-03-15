import AdminForm from "@/components/Admin/AdminForm";
import { getVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchProposalTypes } from "@/app/admin/actions";
import Tenant from "@/lib/tenant/tenant";

async function fetchVotableSupply() {
  "use server";
  return getVotableSupply();
}

export default async function Page() {

  const { ui } = Tenant.current();

  if (!ui.toggle("admin")) {
    return <div>Route not supported for namespace</div>;
  }

  const votableSupply = await fetchVotableSupply();
  const proposalTypes = await fetchProposalTypes();

  return (
    <AdminForm votableSupply={votableSupply} proposalTypes={proposalTypes} />
  );
}
