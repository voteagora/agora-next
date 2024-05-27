import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { ImpactMetricCommentVote } from "./impactMetricComment";

async function updateImpactMetricCommentVoteApi({
  commentId,
  address,
  vote,
}: {
  commentId: number;
  address: string;
  vote: number;
}): Promise<ImpactMetricCommentVote> {
  const commentVote = await prisma.metrics_comments_votes.upsert({
    where: {
      comment_id_voter: {
        comment_id: commentId,
        voter: address,
      },
    },
    update: {
      vote,
      updated_at: new Date(),
    },
    create: {
      comment_id: commentId,
      voter: address,
      vote,
    },
  });

  return {
    commentId: commentVote.comment_id,
    address: commentVote.voter,
    vote: commentVote.vote,
    createdAt: commentVote.created_at,
    updatedAt: commentVote.updated_at,
  };
}

export const updateImpactMetricCommentVote = cache(
  updateImpactMetricCommentVoteApi
);
