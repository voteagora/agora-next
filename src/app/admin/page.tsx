import AdminForm from "@/components/Admin/AdminForm";
import { fetchVotableSupply as apiFetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchProposalTypes, fetchScopes } from "@/app/admin/actions";
import Tenant from "@/lib/tenant/tenant";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchVotableSupply() {
  "use server";
  return apiFetchVotableSupply();
}

export default async function Page() {
  const { ui } = Tenant.current();

  if (!ui.toggle("admin")) {
    return <div>Route not supported for namespace</div>;
  }

  const votableSupply = await fetchVotableSupply();
  const proposalTypes = await fetchProposalTypes();
  const scopes = await fetchScopes();

  return (
    <AdminForm
      votableSupply={votableSupply}
      proposalTypes={proposalTypes}
      scopes={scopes}
    />
  );
}
