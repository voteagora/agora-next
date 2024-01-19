import RetroPGFResults from "@/components/RetroPGF/RetroPGFResults";
import { VStack } from "@/components/Layout/Stack";
import { getRetroPGFResults } from "@/app/retropgf/actions";

/**
 * TODO:
 * - Get exact fields from query, where is image coming from
 * - Text-ellipsis if project text is too long?
 * - Get filters on query
 * - Get mobile design
 * - Where is this conversion of these impactCategories [ 'DEVELOPER_ECOSYSTEM', 'END_USER_EXPERIENCE_AND_ADOPTION' ] into "Tooling and utilities", "End UX & Adoption"
 * - update links
 */
export default async function Page() {
  const projects = await getRetroPGFResults().catch((error) =>
    console.error("error", error)
  );

  return (
    <VStack className="my-8 max-w-6xl rounded-xl border border-gray-300 shadow-newDefault overflow-hidden">
      <RetroPGFResults
        initialResults={projects.edges}
        initialPageInfo={projects.pageInfo}
      />
    </VStack>
  );
}
