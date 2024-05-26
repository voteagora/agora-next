import { cache } from "react";
import prisma from "@/app/lib/prisma";

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
}) {
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
    content: updatedComment.comment,
    address: updatedComment.address,
    createdAt: updatedComment.created_at,
    updatedAt: updatedComment.updated_at,
    votesCount: updatedComment.metrics_comments_votes.reduce(
      (acc, vote) => acc + vote.vote,
      0
    ),
    votes: updatedComment.metrics_comments_votes,
  };
}

export const updateImpactMetricComment = cache(updateImpactMetricCommentApi);
