/*
 * TanStack Start port of src/app/proposals/draft/[id]/page.tsx.
 * URL: /proposals/draft/:id
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { fetchProposalTypes } from "@/server/admin/proposalTypes";
import DraftProposalPageClient from "@/app/proposals/draft/[id]/DraftProposalPageClient";

export const Route = createFileRoute("/proposals/draft/$id")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("proposal-lifecycle")?.enabled) {
      throw redirect({ to: "/proposals" });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    share: (search.share as string) ?? undefined,
  }),
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `Draft Proposal | ${brandName}` },
        {
          name: "description",
          content: `Review and edit a ${brandName} governance proposal draft.`,
        },
      ],
    };
  },
  loader: async () => {
    const proposalTypes = await fetchProposalTypes();
    return { proposalTypes };
  },
  component: function DraftProposalPage() {
    const { proposalTypes } = Route.useLoaderData();
    const { id } = Route.useParams();
    const searchParams = Route.useSearch();
    return (
      <DraftProposalPageClient
        idParam={id}
        searchParams={searchParams as Record<string, string>}
        proposalTypes={proposalTypes}
      />
    );
  },
});
