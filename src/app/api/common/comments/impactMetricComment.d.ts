import { Prisma } from "@prisma/client";

export type ImpactMetrciCommentPayload =
  Prisma.metrics_commentsGetPayload<true> & {
    metrics_comments_votes: Prisma.metrics_comments_votesGetPayload<true>[];
  };

export type ImpactMetricComment = {
  commentId: number;
  comment: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  votesCount: number;
  votes: ImpactMetricCommentVote[];
};

export type ImpactMetricCommentVote = {
  commentId: number;
  address: string;
  vote: number;
  createdAt: Date;
  updatedAt: Date;
};
