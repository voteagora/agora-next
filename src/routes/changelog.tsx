/*
 * TanStack Start port of src/app/changelog/page.tsx.
 * URL: /changelog
 * Note: "use server" fetchChangelogForDAO replaced with createServerFn.
 */

import { createServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import ChangelogList from "@/components/Changelog/ChangelogList";

const serverFetchChangelog = createServerFn({ method: "GET" })
  .inputValidator((data: { limit: number; offset: number }) => data)
  .handler(async ({ data }) => {
    const { fetchChangelogForDAO } = await import(
      "@/app/api/common/changelogs/getChangelogs"
    );
    const { slug } = Tenant.current();
    return fetchChangelogForDAO({
      daoSlug: slug,
      pagination: { limit: data.limit, offset: data.offset },
    });
  });

export const Route = createFileRoute("/changelog")({
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `${brandName} Gov Client Changelog - Agora` },
        {
          name: "description",
          content: `Stay up to date with the latest changes with Agora's development for the ${brandName} community.`,
        },
      ],
    };
  },
  loader: async () => {
    const { ui } = Tenant.current();
    if (ui.toggle("changelog/simplified-view")?.enabled) {
      return { simplified: true, initChangelog: null };
    }
    const initChangelog = await serverFetchChangelog({
      data: { limit: 1, offset: 0 },
    });
    return { simplified: false, initChangelog };
  },
  component: function ChangelogPage() {
    const { simplified, initChangelog } = Route.useLoaderData();

    if (simplified) {
      return (
        <div className="px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl" />
        </div>
      );
    }

    return (
      <div className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ChangelogList
            initChangelog={initChangelog!}
            fetchChangelogForDAO={({ limit, offset }) =>
              serverFetchChangelog({ data: { limit, offset } })
            }
          />
        </div>
      </div>
    );
  },
});
