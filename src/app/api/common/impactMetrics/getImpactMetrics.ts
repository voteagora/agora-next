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
          updated_at: "desc",
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
        commentId: comment.comment_id,
        comment: comment.comment,
        address: comment.address,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        votesCount: comment.metrics_comments_votes.reduce(
          (acc, vote) => acc + vote.vote,
          0
        ),
        votes: comment.metrics_comments_votes.map((vote) => {
          return {
            commentId: vote.comment_id,
            address: vote.voter,
            vote: vote.vote,
            createdAt: vote.created_at,
            updatedAt: vote.updated_at,
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
