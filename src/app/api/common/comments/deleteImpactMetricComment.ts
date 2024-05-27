import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function deleteImpactMetricCommentApi({
  commentId,
}: {
  commentId: number;
}) {
  const deletedComment = await prisma.metrics_comments.delete({
    where: {
      comment_id: commentId,
    },
    include: {
      metrics_comments_votes: true,
    },
  });

  return {
    commentId: deletedComment.comment_id,
  };
}

export const deleteImpactMetricComment = cache(deleteImpactMetricCommentApi);
