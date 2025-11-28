import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/web2";
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
  const updatedComment = await prismaWeb2Client.metrics_comments.update({
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
    comment_id: updatedComment.comment_id,
    comment: updatedComment.comment,
    address: updatedComment.address,
    created_at: updatedComment.created_at,
    updated_at: updatedComment.updated_at,
    votes_count: updatedComment.metrics_comments_votes.reduce(
      (acc, vote) => acc + vote.vote,
      0
    ),
    votes: updatedComment.metrics_comments_votes.map((vote) => {
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

export const updateImpactMetricComment = cache(updateImpactMetricCommentApi);
