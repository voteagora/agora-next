import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { ImpactMetricComment } from "./impactMetricComment";

async function updateImpactMetricCommentApi({
  commentId,
  metricId,
  address,
  comment,
}: {
  commentId: number;
  metricId: string;
  address: string;
  comment: string;
}): Promise<ImpactMetricComment> {
  const updatedComment = await prisma.metrics_comments.update({
    where: {
      comment_id: commentId,
    },
    data: {
      comment,
      metric_id: metricId,
      address,
      updated_at: new Date(),
    },
    include: {
      metrics_comments_votes: true,
    },
  });

  return {
    commentId: updatedComment.comment_id,
    comment: updatedComment.comment,
    address: updatedComment.address,
    createdAt: updatedComment.created_at,
    updatedAt: updatedComment.updated_at,
    votesCount: updatedComment.metrics_comments_votes.reduce(
      (acc, vote) => acc + vote.vote,
      0
    ),
    votes: updatedComment.metrics_comments_votes.map((vote) => {
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

export const updateImpactMetricComment = cache(updateImpactMetricCommentApi);
