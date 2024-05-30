import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function getImpactMetricsApi(roundId: string) {
  const impactMetrics = await prisma.metrics_data.findMany({
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

  return impactMetrics.map((impactMetric) => {
    return {
      metric_id: impactMetric.metric_id,
      name: impactMetric.name,
      description: impactMetric.description,
      allocations_per_project: impactMetric.metrics_projects.map((project) => {
        return {
          project_id: project.projects_data.project_id,
          name: project.projects_data.project_name,
          image: project.projects_data.project_image,
          allocation: project.allocation,
        };
      }),
      comments: impactMetric.metrics_comments.map((comment) => {
        return {
          comment_id: comment.comment_id,
          comment: comment.comment,
          address: comment.address,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          votes_count: comment.metrics_comments_votes.reduce(
            (acc, vote) => acc + vote.vote,
            0
          ),
          votes: comment.metrics_comments_votes.map((vote) => {
            return {
              comment_id: vote.comment_id,
              address: vote.voter,
              vote: vote.vote,
              created_at: vote.created_at,
              updated_at: vote.updated_at,
            };
          }),
        };
      }),
      views: impactMetric.metrics_views.length,
      added_to_ballot: 0,
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
    metric_id: impactMetric.metric_id,
    name: impactMetric.name,
    description: impactMetric.description,
    allocations_per_project: impactMetric.metrics_projects.map((project) => {
      return {
        project_id: project.projects_data.project_id,
        name: project.projects_data.project_name,
        image: project.projects_data.project_image,
        allocation: project.allocation,
      };
    }),
    comments: impactMetric.metrics_comments.map((comment) => {
      return {
        comment_id: comment.comment_id,
        comment: comment.comment,
        address: comment.address,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        votes_count: comment.metrics_comments_votes.reduce(
          (acc, vote) => acc + vote.vote,
          0
        ),
        votes: comment.metrics_comments_votes.map((vote) => {
          return {
            comment_id: vote.comment_id,
            address: vote.voter,
            vote: vote.vote,
            created_at: vote.created_at,
            updated_at: vote.updated_at,
          };
        }),
      };
    }),
    views: impactMetric.metrics_views.length,
    added_to_ballot: 0,
  };
}

export const fetchImpactMetricsApi = cache(getImpactMetricsApi);
export const fetchImpactMetricApi = cache(getImpactMetricApi);
