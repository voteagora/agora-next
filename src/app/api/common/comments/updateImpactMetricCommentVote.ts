import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/web2";
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
  const existingVote = await prismaWeb2Client.metrics_comments_votes.findUnique(
    {
      where: {
        comment_id_voter: {
          comment_id: commentId,
          voter: address,
        },
      },
    }
  );

  const voteValue = existingVote
    ? Math.max(-1, Math.min(1, existingVote.vote + vote))
    : vote;

  const commentVote = await prismaWeb2Client.metrics_comments_votes.upsert({
    where: {
      comment_id_voter: {
        comment_id: commentId,
        voter: address,
      },
    },
    update: {
      vote: voteValue,
      updated_at: new Date(),
    },
    create: {
      comment_id: commentId,
      voter: address,
      vote,
    },
  });

  return {
    comment_id: commentVote.comment_id,
    address: commentVote.voter,
    vote: commentVote.vote,
    created_at: commentVote.created_at,
    updated_at: commentVote.updated_at,
  };
}

export const updateImpactMetricCommentVote = cache(
  updateImpactMetricCommentVoteApi
);
