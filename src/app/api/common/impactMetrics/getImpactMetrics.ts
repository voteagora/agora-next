import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/web2";

async function getImpactMetricsApi(roundId: string) {
  const impactMetrics = await prismaWeb2Client.$queryRawUnsafe<
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
      COALESCE((
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
      ), '[]'::json) AS allocations_per_project,
      COALESCE((
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
            'votes', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'comment_id', v.comment_id,
                  'address', v.voter,
                  'vote', v.vote,
                  'created_at', v.created_at,
                  'updated_at', v.updated_at
                )
              ) FROM retro_funding.metrics_comments_votes v WHERE v.comment_id = c.comment_id
            ), '[]'::json)
          ) ORDER BY c.updated_at DESC
        )
        FROM retro_funding.metrics_comments c
        WHERE c.metric_id = m.metric_id
      ),'[]'::json) AS comments,
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
        SELECT ROUND((COUNT(*)::numeric / (SELECT COUNT(*)::int FROM agora.citizens WHERE retro_funding_round = $1) * 100)::numeric, 2)::float
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

async function getImpactMetricApi(impactMetricId: string, roundId: string) {
  const impactMetric = await prismaWeb2Client.$queryRawUnsafe<
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
      COALESCE((
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
      ), '[]'::json) AS allocations_per_project,
      COALESCE((
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
            'votes', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'comment_id', v.comment_id,
                  'address', v.voter,
                  'vote', v.vote,
                  'created_at', v.created_at,
                  'updated_at', v.updated_at
                )
              ) FROM retro_funding.metrics_comments_votes v WHERE v.comment_id = c.comment_id
            ), '[]'::json)
          ) ORDER BY c.updated_at DESC
        )
        FROM retro_funding.metrics_comments c
        WHERE c.metric_id = m.metric_id
      ),'[]'::json) AS comments,
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
        SELECT ROUND((COUNT(*)::numeric / (SELECT COUNT(*)::int FROM agora.citizens WHERE retro_funding_round = $1) * 100)::numeric, 2)::float
        FROM (
          SELECT a.address as a, b.address as b
          FROM retro_funding.allocations a
          LEFT JOIN agora.citizens b ON LOWER(a.address) = LOWER(b.address)
          WHERE a.metric_id = m.metric_id AND a.round = $1::numeric AND b.retro_funding_round = $1
        ) as added_to_ballot WHERE added_to_ballot.b IS NOT NULL
      ) AS added_to_ballot
    FROM retro_funding.metrics_data m
    WHERE m.metric_id = $2;
    `,
    roundId,
    impactMetricId
  );

  return impactMetric[0] || null;
}

export const fetchImpactMetricsApi = cache(getImpactMetricsApi);
export const fetchImpactMetricApi = cache(getImpactMetricApi);
