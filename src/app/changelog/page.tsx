import { fetchChangelogForDAO } from "@/app/api/common/changelogs/getChangelogs";
import ChangelogList from "@/components/Changelog/ChangelogList";
import Tenant from "@/lib/tenant/tenant";

export async function generateMetadata() {
  const { brandName } = Tenant.current();
  return {
    title: `${brandName} Gov Client Changelog - Agora`,
    description: `Stay up to date with the latest changes with Agora's development for the ${brandName} community.`,
  };
}

export const revalidate = 300;

export default async function Page() {
  const { slug } = Tenant.current();
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
