/*
 * TanStack Start port of src/app/badges/[badgeId]/page.tsx.
 * URL: /badges/:badgeId
 */

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import Hero from "@/components/Hero/Hero";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateContent from "@/components/Delegates/DelegateCardList/DelegateContent";
import { BadgeDelegateLoadingState } from "@/app/badges/[badgeId]/BadgeDelegateWrapper";

const serverFetchDelegatesWithBadge = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { badgeId: string; offset: number; limit: number }) => data
  )
  .handler(async ({ data }) => {
    const { fetchDelegatesWithBadge } = await import(
      "@/app/api/common/badges/getDelegatesWithBadge"
    );
    return fetchDelegatesWithBadge({
      badgeDefinitionId: data.badgeId,
      pagination: { offset: data.offset, limit: data.limit },
    });
  });

export const Route = createFileRoute("/badges/$badgeId")({
  head: () => ({
    meta: [{ title: "Badge Holders" }],
  }),
  loader: async ({ params }) => {
    const { fetchBadgeDefinition } = await import(
      "@/app/api/common/badges/getBadges"
    );
    const badgeDefinition = await fetchBadgeDefinition(params.badgeId);
    if (!badgeDefinition) {
      return { badgeDefinition: null, initialDelegates: null };
    }
    const initialDelegates = await serverFetchDelegatesWithBadge({
      data: { badgeId: params.badgeId, offset: 0, limit: 500 },
    });
    return { badgeDefinition, initialDelegates };
  },
  component: function BadgePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    const { badgeId } = Route.useParams();
    if (!data) return null;
    const { badgeDefinition, initialDelegates } = data;

    if (!badgeDefinition) {
      return (
        <ResourceNotFound message="Hmm... can't find that badge, please check again." />
      );
    }

    if (!initialDelegates) {
      return <BadgeDelegateLoadingState />;
    }

    return (
      <section>
        <Hero page="delegates" />
        <div className="mb-8">
          <h2 className="text-lg font-bold text-primary mb-2">
            Badge Holders for {badgeDefinition.name}
          </h2>
        </div>
        <DelegateContent
          initialDelegates={initialDelegates}
          fetchDelegates={({ pagination = { offset: 0, limit: 500 } }) =>
            serverFetchDelegatesWithBadge({
              data: {
                badgeId,
                offset: pagination.offset,
                limit: pagination.limit,
              },
            })
          }
        />
      </section>
    );
  },
});
