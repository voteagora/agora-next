/*
 * TanStack Start port of src/app/proposals/create-proposal/page.tsx.
 * URL: /proposals/create-proposal
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { fetchProposalTypes } from "@/server/admin/proposalTypes";
import CreateProposalFormClient from "@/components/Proposals/CreateProposalFormClient";

export const Route = createFileRoute("/proposals/create-proposal")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("proposal-lifecycle")?.enabled) {
      throw redirect({ to: "/proposals" });
    }
  },
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `Create Proposal | ${brandName}` },
        {
          name: "description",
          content: `Create a governance proposal for ${brandName}.`,
        },
      ],
    };
  },
  loader: async () => {
    const proposalTypes = await fetchProposalTypes();
    return { proposalTypes };
  },
  component: function CreateProposalPage() {
    const { proposalTypes } = Route.useLoaderData();
    return (
      <main className="max-w-screen-xl mx-auto mt-10">
        <CreateProposalFormClient proposalTypes={proposalTypes} />
      </main>
    );
  },
});
