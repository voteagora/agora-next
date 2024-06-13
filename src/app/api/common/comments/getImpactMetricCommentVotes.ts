import { cache } from "react";
import { ImpactMetricCommentVote } from "./impactMetricComment";
import prisma from "@/app/lib/prisma";

async function getImpactMetricCommentVotesApi({
  commentId,
}: {
  commentId: number;
}): Promise<ImpactMetricCommentVote[]> {
  const votes = await prisma.metrics_comments_votes.findMany({
    where: {
      comment_id: commentId,
    },
  });

  return votes.map((vote) => {
    return {
      comment_id: vote.comment_id,
      address: vote.voter,
      vote: vote.vote,
      created_at: vote.created_at,
      updated_at: vote.updated_at,
    };
  });
}

export const fetchImpactMetricCommentVotes = cache(
  getImpactMetricCommentVotesApi
);
