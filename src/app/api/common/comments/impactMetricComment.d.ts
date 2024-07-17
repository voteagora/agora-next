import { Prisma } from "@prisma/client";

export type ImpactMetrciCommentPayload =
  Prisma.metrics_commentsGetPayload<true> & {
    metrics_comments_votes: Prisma.metrics_comments_votesGetPayload<true>[];
  };

export type ImpactMetricComment = {
  comment_id: number;
  comment: string;
  address: string;
  created_at: Date;
  updated_at: Date;
  votes_count: number;
  votes: ImpactMetricCommentVote[];
};

export type ImpactMetricCommentVote = {
  comment_id: number;
  address: string;
  vote: number;
  created_at: Date;
  updated_at: Date;
};
