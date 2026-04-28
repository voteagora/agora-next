export const dynamic = "force-dynamic"; // needed for app and e2e

import AdminForm from "@/components/Admin/AdminForm";
import { fetchVotableSupply as apiFetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchProposalTypes } from "@/app/admin/actions";
import Tenant from "@/lib/tenant/tenant";
import { buildPageMetadata } from "@/app/lib/utils/metadata";

export const revalidate = 0;

export async function generateMetadata() {
  const { brandName } = Tenant.current();

  return buildPageMetadata({
    title: `${brandName} Admin`,
    description: `Manage ${brandName} governance settings and proposal types.`,
    path: "/admin",
    robots: {
      index: false,
      follow: false,
    },
  });
}

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

  return (
    <AdminForm votableSupply={votableSupply} proposalTypes={proposalTypes} />
  );
}
