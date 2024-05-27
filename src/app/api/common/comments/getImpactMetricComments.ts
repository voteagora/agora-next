import { PaginatedResultEx, paginateResultEx } from "@/app/lib/pagination";
import { cache } from "react";
import prisma from "@/app/lib/prisma";
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
}): Promise<PaginatedResultEx<ImpactMetricComment[]>> {
  const comments = await paginateResultEx(
    (skip: number, take: number) => {
      switch (sort) {
        case "votes":
          return prisma.$queryRawUnsafe<ImpactMetrciCommentPayload[]>(
            `
          SELECT mc.*, 
          SUM(mcv.vote) AS votes_count, 
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
          return prisma.metrics_comments.findMany({
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
  };
}

async function getImpactMetricCommentApi(
  commentId: number
): Promise<ImpactMetricComment> {
  const comment = await prisma.metrics_comments.findFirst({
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
}

export const fetchImpactMetricComments = cache(getImpactMetricCommentsApi);
export const fetchImpactMetricComment = cache(getImpactMetricCommentApi);
