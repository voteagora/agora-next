import { cache } from "react";
import prisma from "@/app/lib/prisma";

async function deleteImpactMetricCommentApi({
  commentId,
}: {
  commentId: number;
}) {

  const votesExist = await prisma.metrics_comments_votes.findMany({
    where: {
      comment_id: commentId,
    },
  });

  // If related votes exist, delete them
  if (votesExist.length > 0) {
    await prisma.metrics_comments_votes.deleteMany({
      where: {
        comment_id: commentId,
      },
    });
  }

  // Check if the comment exists before attempting to delete it
  const commentExists = await prisma.metrics_comments.findUnique({
    where: {
      comment_id: commentId,
    },
  });

  if (commentExists) {
    // Delete the record in the main table
    const deletedComment = await prisma.metrics_comments.delete({
      where: {
        comment_id: commentId,
      },
    });

    return {
      comment_id: deletedComment.comment_id,
    };
  }

  else {
    return {
      comment_id: -1,
    }
  }

}

export const deleteImpactMetricComment = cache(deleteImpactMetricCommentApi);
