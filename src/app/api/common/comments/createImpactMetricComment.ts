import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/web2";
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
  const newComment = await prismaWeb2Client.metrics_comments.create({
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
    comment_id: newComment.comment_id,
    comment: newComment.comment,
    address: newComment.address,
    created_at: newComment.created_at,
    updated_at: newComment.updated_at,
    votes_count: newComment.metrics_comments_votes.reduce(
      (acc, vote) => acc + vote.vote,
      0
    ),
    votes: newComment.metrics_comments_votes.map((vote) => {
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

export const createImpactMetricComment = cache(createImpactMetricCommentApi);
