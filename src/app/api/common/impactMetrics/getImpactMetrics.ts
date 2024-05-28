import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function getImpactMetricsApi(roundId: string) {
  const impactMetrics = await prisma.metrics_data.findMany({
    include: {
      metrics_comments: true,
    },
  });

  return impactMetrics.map((impactMetric) => {
    return {
      metricId: impactMetric.metric_id,
      name: impactMetric.name,
      description: impactMetric.description,
      commentsCount: impactMetric.metrics_comments.length,
    };
  });
}

async function getImpactMetricApi(impactMetricId: string) {
  const impactMetric = await prisma.metrics_data.findFirst({
    where: {
      metric_id: impactMetricId,
    },
    include: {
      metrics_comments: {
        include: {
          metrics_comments_votes: true,
        },
        orderBy: {
          ts: "desc",
        },
      },
      metrics_projects: {
        orderBy: {
          allocation: "desc",
        },
        include: {
          projects_data: true,
        },
      },
      metrics_views: true,
    },
  });

  if (!impactMetric) {
    return null;
  }

  return {
    metricId: impactMetric.metric_id,
    name: impactMetric.name,
    description: impactMetric.description,
    projectAllocations: impactMetric.metrics_projects.map((project) => {
      return {
        projectId: project.projects_data.project_id,
        name: project.projects_data.project_name,
        image: project.projects_data.project_image,
        allocation: project.allocation,
      };
    }),
    comments: impactMetric.metrics_comments.map((comment) => {
      return {
        commenter: comment.address,
        comment: comment.comment,
        ts: comment.ts,
        votes: comment.metrics_comments_votes.map((vote) => {
          return {
            address: vote.voter,
            vote: vote.vote,
          };
        }),
      };
    }),
    views: impactMetric.metrics_views.length,
    addedToBallots: 0,
  };
}

export const fetchImpactMetricsApi = cache(getImpactMetricsApi);
export const fetchImpactMetricApi = cache(getImpactMetricApi);
