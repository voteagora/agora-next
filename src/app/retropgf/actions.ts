"use server";

import { retroPGFCategories, retroPGFSort } from "@/lib/constants";
import { type RetroPGFProject } from "@/lib/types";

export async function getRetroPGFResults({
  endCursor = "",
  search = "",
  category = null,
  orderBy = "mostAwarded",
}: {
  endCursor?: string;
  search: string;
  category: keyof typeof retroPGFCategories | null;
  orderBy: keyof typeof retroPGFSort;
}) {
  const pageSize = 20;
  const seed = Date.now().toString();
  const query = `
      query {
        retroPGF {
          projects(first: ${pageSize}, after: "${endCursor}", search: "${search}", category: ${category}, orderBy: ${orderBy}, seed: "${seed}") {
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

export async function getResultsProjectId(
  id: string
): Promise<RetroPGFProject> {
  const query = `
      {
        retroPGF {
          project(id: "${id}") {
            id
            bio
            impactCategory
            displayName
            websiteUrl
            applicant {
              address {
                address
              }
              id
            }
            applicantType
            profile {
              profileImageUrl
              bannerImageUrl
              id
            }
            includedInBallots
            impactDescription
            contributionDescription
            contributionLinks {
              type
              url
              description
            }
            impactMetrics {
              description
              number
              url
            }
            fundingSources {
              type
              currency
              amount
              description
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
  return data.data.retroPGF.project;
}
