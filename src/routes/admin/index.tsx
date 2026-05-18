/*
 * TanStack Start port of src/app/admin/page.tsx.
 * URL: /admin
 * Note: "use server" fetchVotableSupply replaced with createServerFn.
 */

import { createServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import AdminForm from "@/components/Admin/AdminForm";
import { fetchProposalTypes } from "@/server/admin/proposalTypes";

const serverFetchVotableSupply = createServerFn({ method: "GET" }).handler(
  async () => {
    const { fetchVotableSupply } = await import(
      "@/app/api/common/votableSupply/getVotableSupply"
    );
    return fetchVotableSupply();
  }
);

export const Route = createFileRoute("/admin/")({
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `${brandName} Admin` },
        {
          name: "description",
          content: `Manage ${brandName} governance settings and proposal types.`,
        },
      ],
    };
  },
  loader: async () => {
    const [votableSupply, proposalTypes] = await Promise.all([
      serverFetchVotableSupply(),
      fetchProposalTypes(),
    ]);
    return { votableSupply, proposalTypes };
  },
  component: function AdminPage() {
    const { votableSupply, proposalTypes } = Route.useLoaderData();
    return (
      <AdminForm votableSupply={votableSupply} proposalTypes={proposalTypes} />
    );
  },
});
