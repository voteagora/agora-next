export type PostType = "forum-post" | "tempcheck" | "gov-proposal";

export const postTypeOptions = {
  "forum-post": "Forum post",
  tempcheck: "Temp check",
  "gov-proposal": "Governance proposal",
} as const;

export interface RelatedItem {
  id: string;
  title: string;
  description: string;
  comments: number;
  timestamp: string;
  url?: string;
}

export interface ProposalType {
  id: string;
  name: string;
  description: string;
  quorum: number;
  approvalThreshold: number;
  proposal_type_id?: string;
  module?: string;
}

export interface CreatePostFormData {
  title: string;
  description: string;
  proposalTypeId?: string;
  categoryId?: number;
  relatedDiscussions: RelatedItem[];
  relatedTempChecks: RelatedItem[];
}
