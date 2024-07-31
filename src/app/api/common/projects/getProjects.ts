import { paginateResult, PaginationParams } from "@/app/lib/pagination";
import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function getProjectsApi({
  pagination,
  round,
}: {
  pagination: PaginationParams;
  round?: string;
}) {
  const projects = await paginateResult(async (skip, take) => {
    if (round) {
      return (
        await prisma.project_applicants.findMany({
          where: {
            round: round,
            status: "Passed",
          },
          skip,
          take,
        })
      ).map((data) => {
        return {
          project_id: data.project_id,
          category: data.category,
          name: data.name,
          description: data.description,
          project_avatar_url: data.project_avatar_url,
          project_cover_image_url: data.project_cover_image_url,
          social_links_twitter: data.social_links_twitter,
          social_links_farcaster: data.social_links_farcaster,
          social_links_mirror: data.social_links_mirror,
          social_links_website: data.social_links_website,
          team: data.team,
          github: data.github,
          packages: data.packages,
          contracts: data.contracts,
          grants_and_funding_venture_funding:
            data.grants_and_funding_venture_funding,
          grants_and_funding_grants: data.grants_and_funding_grants,
          grants_and_funding_revenue: data.grants_and_funding_revenue,
        };
      });
    }

    return prisma.projects.findMany({
      skip,
      take,
    });
  }, pagination);

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
