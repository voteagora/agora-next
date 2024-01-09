import RetroPGFResults from "@/components/RetroPGF/RetroPGFResults";
import { VStack } from "@/components/Layout/Stack";

export async function getRetroPGFResults() {
  const query = `
    query {
      retroPGF {
        projects(first: 5) {
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

  return data.data.retroPGF.projects.edges;
}

export default async function Page() {
  const results = await getRetroPGFResults();

  return (
    <VStack className="my-8 max-w-6xl rounded-xl border border-gray-300 shadow-newDefault overflow-hidden">
      <RetroPGFResults results={results} />
    </VStack>
  );
}
