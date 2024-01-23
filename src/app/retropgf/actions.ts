"use server";

import { retroPGFCategories, retroPGFSort } from "@/lib/constants";

// TODO: frh -> check how to shuffle
export async function getRetroPGFResults(
  { endCursor = "", search = "", category = null, orderBy = "mostAwarded" }:
    { endCursor?: string, search: string, category: keyof typeof retroPGFCategories | null, orderBy: keyof typeof retroPGFSort }
) {
  const pageSize = 20;
  const query = `
      query {
        retroPGF {
          projects(first: ${pageSize}, after: "${endCursor}", search: "${search}", category: ${category}, orderBy: ${orderBy}) {
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