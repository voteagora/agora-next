import { OptimismAuthorityChainsSnaps } from "@prisma/client";

export type AuthorityChainsSnaps = OptimismAuthorityChainsSnaps;

export type AuthorityChainRules = {
  allowance: number;
  allowance_type: number;
  custom_rule: string;
  not_valid_after: number;
  not_valid_before: number;
  max_redelegations: number;
  blocks_before_vote_closes: number;
};
