import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { Project } from "./project";

const filterMap = {
  all: null,
  eth_core: "ETHEREUM_CORE_CONTRIBUTIONS",
  op_tooling: "OP_STACK_TOOLING",
  op_rnd: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
};

async function getProjectsApi({
  pagination,
  round,
  category = "all",
}: {
  pagination: PaginationParams;
  round?: string;
  category?: keyof typeof filterMap;
}): Promise<PaginatedResult<Project[]>> {
  const projects = await paginateResult(async (skip, take) => {
    if (round) {
      return (
        await prisma.projectApplicants.findMany({
          where: {
            round: round,
            ...(filterMap[category] && {
              application_category: filterMap[category],
            }),
          },
          skip,
          take,
        })
      ).map((data) => {
        const projectData = data.ipfs_data ?? ({} as any);

        return {
          id: data.application_id,
          applicationId: data.application_id,
          projectId: data.project_id || "",
          category: data.category,
          applicationCategory: data.application_category,
          organization: data.org_ipfs_data as any,
          name: data.name,
          description: projectData.description,
          profileAvatarUrl: projectData.projectAvatarUrl,
          projectCoverImageUrl:
            projectData.proejctCoverImageUrl ||
            projectData.projectCoverImageUrl,
          socialLinks: projectData.socialLinks,
          team: data.team,
          github: projectData.github,
          packages: projectData.packages,
          links: projectData.links,
          contracts: projectData.contracts,
          grantsAndFunding: projectData.grantsAndFunding,
          pricingModel: projectData.pricingModel,
          impactStatement: {
            category: data.application_category,
            subcategory: data.application_subcategory,
            statement: data.impact_statement,
          },
        };
      });
    }

    return (
      await prisma.projects.findMany({
        skip,
        take,
      })
    ).map((project) => {
      return {
        id: project.project_id,
        projectId: project.project_id,
        applicationId: "",
        category: project.category,
        applicationCategory: null,
        organization: null,
        name: project.name,
        description: project.description,
        profileAvatarUrl: project.project_avatar_url,
        projectCoverImageUrl: project.project_cover_image_url,
        socialLinks: {
          twitter: project.social_links_twitter,
          farcaster: project.social_links_farcaster,
          mirror: project.social_links_mirror,
          website: project.social_links_website,
        },
        team: project.team,
        github: project.github,
        packages: project.packages,
        links: [],
        contracts: project.contracts,
        grantsAndFunding: {
          ventureFunding: project.grants_and_funding_venture_funding,
          grants: project.grants_and_funding_grants,
          revenue: project.grants_and_funding_revenue,
        },
        pricingModel: {},
        impactStatement: {
          category: null,
          subcategory: null,
          statement: null,
        },
      };
    });
  }, pagination);

  return {
    meta: projects.meta,
    data: projects.data,
  };
}

async function getProjectApi({
  projectId,
  round,
}: {
  round: string;
  projectId: string;
}) {
  const project = await prisma.projectApplicants.findUnique({
    where: {
      application_id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const projectData = project.ipfs_data ?? ({} as any);

  return {
    id: project.project_id,
    projectId: project.project_id,
    applicationId: project.application_id,
    category: project.category,
    applicationCategory: project.application_category,
    organization: project.org_ipfs_data as any,
    name: project.name,
    description: projectData.description,
    profileAvatarUrl: projectData.projectAvatarUrl,
    projectCoverImageUrl:
      projectData.proejctCoverImageUrl || projectData.projectCoverImageUrl,
    socialLinks: projectData.socialLinks,
    team: project.team,
    github: projectData.github,
    packages: projectData.packages,
    links: projectData.links,
    contracts: projectData.contracts,
    grantsAndFunding: projectData.grantsAndFunding,
    pricingModel: projectData.pricingModel,
    impactStatement: {
      category: project.application_category,
      subcategory: project.application_subcategory,
      statement: project.impact_statement,
    },
  };
}

export const fetchProjectsApi = cache(getProjectsApi);
export const fetchProjectApi = cache(getProjectApi);
