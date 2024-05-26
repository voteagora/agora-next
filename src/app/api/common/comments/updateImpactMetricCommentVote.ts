import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function updateImpactMetricCommentVoteApi({
  commentId,
  address,
  vote,
}: {
  commentId: number;
  address: string;
  vote: number;
}) {
  return prisma.metrics_comments_votes.upsert({
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
}

export const updateImpactMetricCommentVote = cache(
  updateImpactMetricCommentVoteApi
);
