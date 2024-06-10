import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function deleteImpactMetricCommentApi({
  commentId,
}: {
  commentId: number;
}) {


  const deletedVotes = await prisma.metrics_comments_votes.deleteMany({
    where: {
      comment_id: commentId
    }
  });

  const deletedComment = await prisma.metrics_comments.delete({
    where: {
      comment_id: commentId,
    }
  });

  return {
    comment_id: deletedComment.comment_id,
  };
}

export const deleteImpactMetricComment = cache(deleteImpactMetricCommentApi);
