import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/web2";

async function deleteImpactMetricCommentApi({
  commentId,
}: {
  commentId: number;
}) {
  const deletedComment = await prismaWeb2Client.metrics_comments.delete({
    where: {
      comment_id: commentId,
    },
    include: {
      metrics_comments_votes: true,
    },
  });

  return {
    comment_id: deletedComment.comment_id,
  };
}

export const deleteImpactMetricComment = cache(deleteImpactMetricCommentApi);
