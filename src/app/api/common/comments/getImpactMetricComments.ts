import { cache } from "react";

async function getImpactMetricComments(
  roundId: string,
  impactMetricId: string
) {
  const defaultPageMetadata = {
    hasNext: false,
    totalReturned: 1,
    nextOffset: 0,
  };
  const defaultComments = [
    {
      id: "1",
      content: "Comment 1",
      commenter: "0x1234",
      createdAt: "2021-10-01T00:00:00Z",
      editedAt: "2021-10-01T00:00:00Z",
    },
  ];
  return defaultComments;
}

async function getImpactMetricComment(
  roundId: string,
  impactMetricId: string,
  commentId: string
) {
  const defaultComment = {
    id: commentId,
    content: `Comment id ${commentId}`,
    commenter: "0x1234",
    createdAt: "2021-10-01T00:00:00Z",
    editedAt: "2021-10-01T00:00:00Z",
  };
  return defaultComment;
}

export const fetchImpactMetricComments = cache(getImpactMetricComments);
export const fetchImpactMetricComment = cache(getImpactMetricComment);
