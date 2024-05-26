import { paginateResultEx } from "@/app/lib/pagination";
import { cache } from "react";

async function getImpactMetricCommentsApi({
  roundId,
  impactMetricId,
  sortBy = "ts",
  limit = 10,
  offset = 0,
}: {
  roundId: string;
  impactMetricId: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  const comments = await paginateResultEx(
    (skip: number, take: number) => {
      return prisma.metrics_comments.findMany({
        where: {
          metric_id: impactMetricId,
        },
        orderBy: {
          [sortBy]: "desc",
        },
        include: {
          metrics_comments_votes: true,
        },
        skip,
        take,
      });
    },
    { limit: 10, offset: 0 }
  );

  return {
    meta: comments.meta,
    data: comments.data.map((comment) => {
      return {
        commentId: comment.comment_id,
        content: comment.comment,
        address: comment.address,
        createdAt: comment.ts,
        editedAt: comment.ts,
        votes: comment.metrics_comments_votes.reduce(
          (acc, vote) => acc + vote.vote,
          0
        ),
      };
    }),
  };
}

async function getImpactMetricCommentApi(commentId: number) {
  const comment = await prisma.metrics_comments.findFirst({
    where: {
      comment_id: commentId,
    },
    include: {
      metrics_comments_votes: true,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  return {
    commentId: comment.comment_id,
    content: comment.comment,
    address: comment.address,
    createdAt: comment.ts,
    editedAt: comment.ts,
    votes: comment.metrics_comments_votes.reduce(
      (acc, vote) => acc + vote.vote,
      0
    ),
  };
}

export const fetchImpactMetricComments = cache(getImpactMetricCommentsApi);
export const fetchImpactMetricComment = cache(getImpactMetricCommentApi);
