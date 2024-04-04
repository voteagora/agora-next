import RetroPGFResults from "@/components/RetroPGF/RetroPGFResults";
import RetroPGFHero from "@/components/RetroPGF/RetroPGFHero";
import RetroPGFFilters from "@/components/RetroPGF/RetroPGFFilters";
import { getRetroPGFResults } from "@/app/retropgf/actions";
import { retroPGFCategories, retroPGFSort } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    search?: string;
    category?: keyof typeof retroPGFCategories;
    orderBy?: keyof typeof retroPGFSort;
  };
}) {
  const { ui } = Tenant.current();

  if (!ui.toggle("retropgf")) {
    return <div>Route not supported for namespace</div>;
  }

  const projects = await getRetroPGFResults({
    search: searchParams.search || "",
    category: searchParams.category || null,
    orderBy: searchParams.orderBy || "mostAwarded",
  }).catch((error) => console.error("error", error));

  return (
    <>
      <RetroPGFHero />
      <RetroPGFFilters />
      <RetroPGFResults
        initialResults={projects.edges}
        initialPageInfo={projects.pageInfo}
      />
    </>
  );
}
