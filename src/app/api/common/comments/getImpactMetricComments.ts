import { PaginatedResult, paginateResult } from "@/app/lib/pagination";
import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/web2";
import {
  ImpactMetrciCommentPayload,
  ImpactMetricComment,
} from "./impactMetricComment";

async function getImpactMetricCommentsApi({
  roundId,
  impactMetricId,
  sort,
  limit,
  offset,
}: {
  roundId: string;
  impactMetricId: string;
  sort: string;
  limit: number;
  offset: number;
}): Promise<PaginatedResult<ImpactMetricComment[]>> {
  const comments = await paginateResult(
    (skip: number, take: number) => {
      switch (sort) {
        case "votes":
          return prismaWeb2Client.$queryRawUnsafe<ImpactMetrciCommentPayload[]>(
            `
          SELECT mc.*, 
          COALESCE(SUM(mcv.vote),0) AS votes_count, 
          ARRAY_AGG(jsonb_build_object(
            'comment_id', mcv.comment_id,
            'voter', mcv.voter,
            'vote', mcv.vote,
            'created_at', mcv.created_at,
            'updated_at', mcv.updated_at
          )) AS metrics_comments_votes
          FROM retro_funding.metrics_comments mc
          LEFT JOIN retro_funding.metrics_comments_votes mcv ON mc.comment_id = mcv.comment_id
          WHERE mc.metric_id = $1
          GROUP BY mc.comment_id
          ORDER BY votes_count DESC
          LIMIT ${take}
          OFFSET ${skip}
        `,
            impactMetricId
          );
        default:
          return prismaWeb2Client.metrics_comments.findMany({
            where: {
              metric_id: impactMetricId,
            },
            orderBy: {
              updated_at: "desc",
            },
            include: {
              metrics_comments_votes: true,
            },
            skip,
            take,
          });
      }
    },
    { limit, offset }
  );

  return {
    meta: comments.meta,
    data: comments.data.map((comment) => {
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
  };
}

async function getImpactMetricCommentApi(
  commentId: number
): Promise<ImpactMetricComment> {
  const comment = await prismaWeb2Client.metrics_comments.findFirst({
    where: {
      comment_id: commentId,
    },
    include: {
      metrics_comments_votes: true,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

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
}

export const fetchImpactMetricComments = cache(getImpactMetricCommentsApi);
export const fetchImpactMetricComment = cache(getImpactMetricCommentApi);
