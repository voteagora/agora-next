import { paginateResultEx } from "@/app/lib/pagination";
import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function getProjectsApi({
  limit,
  offset,
  round,
}: {
  limit: number;
  offset: number;
  round?: string;
}) {
  const projects = await paginateResultEx(
    async (skip, take) => {
      if (round) {
        return prisma.project_applicants.findMany({
          where: {
            round: round,
            status: "Passed",
          },
          skip,
          take,
        });
      }

      return prisma.projects.findMany({
        skip,
        take,
      });
    },
    {
      limit,
      offset,
    }
  );

  return {
    meta: projects.meta,
    data: projects.data.map((project) => {
      return {
        id: project.project_id,
        category: project.category,
        name: project.name,
        description: project.description,
        profileAvatarUrl: project.project_avatar_url,
        proejctCoverImageUrl: project.project_cover_image_url,
        socialLinks: {
          twitter: project.social_links_twitter,
          farcaster: project.social_links_farcaster,
          mirror: project.social_links_mirror,
          website: project.social_links_website,
        },
        team: project.team,
        github: project.github,
        packages: project.packages,
        contracts: project.contracts,
        grantsAndFunding: {
          ventureFunding: project.grants_and_funding_venture_funding,
          grants: project.grants_and_funding_grants,
          revenue: project.grants_and_funding_revenue,
        },
      };
    }),
  };
}

export const fetchProjectsApi = cache(getProjectsApi);
