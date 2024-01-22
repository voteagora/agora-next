import RetroPGFResults from "@/components/RetroPGF/RetroPGFResults";
import RetroPGFHero from "@/components/RetroPGF/RetroPGFHero";
import RetroPGFFilters from "@/components/RetroPGF/RetroPGFFilters";
import { getRetroPGFResults } from "@/app/retropgf/actions";

/**
 * TODO:
 * - Get exact fields from query, where is image coming from
 * - Text-ellipsis if project text is too long?
 * - Get filters on query
 * - Get mobile design and styles of desktop
 * - Make sure you port over the Card when you click
 */
export default async function Page() {
  const projects = await getRetroPGFResults().catch((error) =>
    console.error("error", error)
  );

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
