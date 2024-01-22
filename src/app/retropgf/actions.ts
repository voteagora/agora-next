"use server";

export async function getRetroPGFResults(endCursor: string = "") {
  const pageSize = 20;
  const query = `
      query {
        retroPGF {
          projects(first: ${pageSize}, after: "${endCursor}") {
            pageInfo {
              hasNextPage
              endCursor
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
                includedInLists
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

  const url = "https://optimism-agora-prod.agora-prod.workers.dev/graphql";
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