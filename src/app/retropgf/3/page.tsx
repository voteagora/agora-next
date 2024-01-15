// TODO: merge with main once summary retropgf is merged and update links
import RetroPGFResults from "@/components/RetroPGF/RetroPGFResults";
import { VStack } from "@/components/Layout/Stack";

/**
 * TODO:
 * - Get exact fields from query, where is image coming from
 * - Text-ellipsis if project text is too long?
 * - Get filters on query
 * - Get mobile design
 * - Check if url is prod or not
 * - Infinite scroll?
 * - Where is this conversion of these impactCategories [ 'DEVELOPER_ECOSYSTEM', 'END_USER_EXPERIENCE_AND_ADOPTION' ] into "Tooling and utilities", "End UX & Adoption"
 */
// TODO: frh -> investigate apollo for infinite scroll
// TODO: frh -> filters
export async function getRetroPGFResults() {
  const query = `
    query {
      retroPGF {
        projects(first: 5) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              applicant {
                address {
                  address
                  resolvedName {
                    address
                    name
                  }
                }
              }
              awarded
              displayName
              id
              impactCategory
              includedInBallots
              lists {
                id
              }
              profile {
                profileImageUrl
                name
              }
            }
          }
        }
      }
    }
  `;

  const url = "https://optimism-agora-dev.agora-dev.workers.dev/graphql";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  };

  const response = await fetch(url, options);
  const data = await response.json();

  return data.data.retroPGF.projects;
}

export default async function Page() {
  const projects = await getRetroPGFResults();
  console.log("results page: ", projects);

  return (
    <VStack className="my-8 max-w-6xl rounded-xl border border-gray-300 shadow-newDefault overflow-hidden">
      <RetroPGFResults
        results={projects.edges}
        hasNextPage={projects.pageInfo.hasNextPage}
      />
    </VStack>
  );
}
