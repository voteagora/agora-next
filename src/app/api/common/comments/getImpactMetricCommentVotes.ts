import { cache } from "react";

async function getImpactMetricCommentVotesApi({
  commentId,
}: {
  commentId: number;
}) {
  return prisma.metrics_comments_votes.findMany({
    where: {
      comment_id: commentId,
    },
  });
}

export const fetchImpactMetricCommentVotes = cache(
  getImpactMetricCommentVotesApi
);
