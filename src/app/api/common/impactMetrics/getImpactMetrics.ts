import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function getImpactMetricsApi(roundId: string) {
  const impactMetrics = await prisma.$queryRawUnsafe<
    {
      metric_id: number;
      name: string;
      description: string;
      url: string;
      allocations_per_project: {
        project_id: number;
        name: string;
        image: string;
        allocation: string;
        is_os: boolean;
      }[];
      comments: {
        comment_id: number;
        comment: string;
        address: string;
        created_at: Date;
        updated_at: Date;
        votes_count: number;
        votes: {
          comment_id: number;
          address: string;
          vote: number;
          created_at: Date;
          updated_at: Date;
        }[];
      }[];
      views: number;
      added_to_ballot: number;
    }[]
  >(
    `
    SELECT 
      m.metric_id, 
      m.name, 
      m.description, 
      m.url,
      (
        SELECT json_agg(
          json_build_object(
            'project_id', p.project_id,
            'name', p.project_name,
            'image', p.project_image,
            'allocation', mp.allocation::text,
            'is_os', mp.is_os
          ) ORDER BY mp.allocation DESC
        )
        FROM retro_funding.metrics_projects mp
        JOIN retro_funding.projects_data p ON mp.project_id = p.project_id
        WHERE mp.metric_id = m.metric_id
      ) AS allocations_per_project,
      (
        SELECT json_agg(
          json_build_object(
            'comment_id', c.comment_id,
            'comment', c.comment,
            'address', c.address,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'votes_count', COALESCE(
              (SELECT SUM(v.vote) FROM retro_funding.metrics_comments_votes v WHERE v.comment_id = c.comment_id), 0
            ),
            'votes', (
              SELECT json_agg(
                json_build_object(
                  'comment_id', v.comment_id,
                  'address', v.voter,
                  'vote', v.vote,
                  'created_at', v.created_at,
                  'updated_at', v.updated_at
                )
              ) FROM retro_funding.metrics_comments_votes v WHERE v.comment_id = c.comment_id
            )
          ) ORDER BY c.updated_at DESC
        )
        FROM retro_funding.metrics_comments c
        WHERE c.metric_id = m.metric_id
      ) AS comments,
      (
        SELECT COUNT(*)::int
        FROM (
          SELECT v.address as v, b.address as b
          FROM retro_funding.metrics_views v
          LEFT JOIN agora.citizens b ON LOWER(v.address) = LOWER(b.address)
          WHERE v.metric_id = m.metric_id AND b.retro_funding_round = $1
        ) as views WHERE views.b IS NOT NULL
      ) AS views,
      (
        SELECT COUNT(*)::int
        FROM (
          SELECT a.address as a, b.address as b
          FROM retro_funding.allocations a
          LEFT JOIN agora.citizens b ON LOWER(a.address) = LOWER(b.address)
          WHERE a.metric_id = m.metric_id AND a.round = $1::numeric AND b.retro_funding_round = $1
        ) as added_to_ballot WHERE added_to_ballot.b IS NOT NULL
      ) AS added_to_ballot
    FROM retro_funding.metrics_data m;
    `,
    roundId
  );

  return impactMetrics;
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
    url: impactMetric.url,
    allocations_per_project: impactMetric.metrics_projects.map((project) => {
      return {
        project_id: project.projects_data.project_id,
        name: project.projects_data.project_name,
        image: project.projects_data.project_image,
        allocation: project.allocation,
        is_os: project.is_os,
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
