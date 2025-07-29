// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import { fetchChangelogForDAO } from "@/app/api/common/changelogs/getChangelogs";
import ChangelogList from "@/components/Changelog/ChangelogList";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

export async function generateMetadata() {
  const { brandName } = Tenant.current();
  return {
    title: `${brandName} Gov Client Changelog - Agora`,
    description: `Stay up to date with the latest changes with Agora's development for the ${brandName} community.`,
  };
}

export const revalidate = 300;

export default async function Page() {
  const { slug, ui } = Tenant.current();

  // Check if simplified changelog view is enabled via feature flag
  if (ui.toggle("changelog/simplified-view")?.enabled) {
    return (
      <div className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl"></div>
      </div>
    );
  }

  // For all other tenants, use the full changelog implementation
  const initChangelog = await fetchChangelogForDAO({
    daoSlug: slug,
    pagination: {
      limit: 1,
      offset: 0,
    },
  });

  return (
    <div className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <ChangelogList
          initChangelog={initChangelog}
          fetchChangelogForDAO={async ({ limit, offset }) => {
            "use server";
            return fetchChangelogForDAO({
              daoSlug: slug,
              pagination: {
                limit,
                offset,
              },
            });
          }}
        />
      </div>
    </div>
  );
}
