/*
 * TanStack Start port of src/app/forums/new/page.tsx.
 * URL: /forums/new
 */

import { createFileRoute } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import ForumNewClient, {
  type FormData,
  type RelatedProposal,
} from "@/components/Forum/ForumNewClient";

export const Route = createFileRoute("/forums/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    fromProposalId: (search.fromProposalId as string) ?? undefined,
    proposalTag: (search.proposalTag as string) ?? undefined,
  }),
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `New Forum Topic | ${brandName}` },
        {
          name: "description",
          content: `Start a new governance forum discussion for the ${brandName} community.`,
        },
      ],
    };
  },
  loaderDeps: ({ search }) => ({
    fromProposalId: search.fromProposalId,
    proposalTag: search.proposalTag,
  }),
  loader: async ({ deps }) => {
    const { fromProposalId, proposalTag } = deps;
    const { namespace } = Tenant.current();

    const formData: FormData = {
      title: "",
      description: "",
      categoryId: undefined,
    };

    let relatedProposal: RelatedProposal | undefined = undefined;

    if (fromProposalId && proposalTag) {
      const { fetchProposalFromArchive } = await import("@/lib/archiveUtils");
      const fetchedProposal = await fetchProposalFromArchive(
        namespace,
        fromProposalId
      );

      if (fetchedProposal) {
        formData.title = fetchedProposal.title || "";
        formData.description = fetchedProposal.description || "";

        relatedProposal = {
          id: fromProposalId,
          type: proposalTag,
          title: fetchedProposal.title || "",
          description: fetchedProposal.description || "",
          createdAt: new Date(
            fetchedProposal.start_blocktime * 1000 || Date.now()
          ).toISOString(),
        };
      }
    }

    return { formData, relatedProposal };
  },
  component: function NewForumTopicPage() {
    const { formData, relatedProposal } = Route.useLoaderData();
    return (
      <ForumNewClient
        initialFormData={formData}
        relatedProposal={relatedProposal}
      />
    );
  },
});
