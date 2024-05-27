import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { ImpactMetricComment } from "./impactMetricComment";

async function createImpactMetricCommentApi({
  metricId,
  address,
  comment,
}: {
  metricId: string;
  address: string;
  comment: string;
}): Promise<ImpactMetricComment> {
  const newComment = await prisma.metrics_comments.create({
    data: {
      comment,
      metric_id: metricId,
      address,
    },
    include: {
      metrics_comments_votes: true,
    },
  });

  return {
    commentId: newComment.comment_id,
    comment: newComment.comment,
    address: newComment.address,
    createdAt: newComment.created_at,
    updatedAt: newComment.updated_at,
    votesCount: newComment.metrics_comments_votes.reduce(
      (acc, vote) => acc + vote.vote,
      0
    ),
    votes: newComment.metrics_comments_votes.map((vote) => {
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

export const createImpactMetricComment = cache(createImpactMetricCommentApi);
