import { ProposalType, PostType } from "../types";

export function filterProposalTypesByType(
  proposalTypes: ProposalType[],
  typeCategory: "tempcheck" | "gov-proposal"
): ProposalType[] {
  return proposalTypes.filter(
    (type) => type.module?.toLowerCase() === typeCategory.toLowerCase()
  );
}
