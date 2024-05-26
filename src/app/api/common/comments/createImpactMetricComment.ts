import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function createImpactMetricCommentApi({
  metricId,
  address,
  comment,
}: {
  metricId: string;
  address: string;
  comment: string;
}) {
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
    content: newComment.comment,
    address: newComment.address,
    createdAt: newComment.created_at,
    updatedAt: newComment.updated_at,
    votes: newComment.metrics_comments_votes.reduce(
      (acc, vote) => acc + vote.vote,
      0
    ),
  };
}

export const createImpactMetricComment = cache(createImpactMetricCommentApi);
