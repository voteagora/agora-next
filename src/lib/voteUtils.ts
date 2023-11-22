/**
 * Parse vote params
 */

import { ProposalType } from "@prisma/client";
import { parseProposalData } from "./proposalUtils";

type ParsedParams = {
  APPROVAL: {
    key: "APPROVAL";
    kind: string[];
  };
};

export function parseParams(
  params: string | null,
  proposaData: string,
  proposalType: ProposalType
): string[] | null {
  if (params === null || proposalType !== "APPROVAL") {
    return null;
  }

  try {
    const parsedParams = JSON.parse(params);
    const parsedProposalData = parseProposalData(proposaData, proposalType);
    // BS way to make to force parse options
    const proposalOptions =
      parsedProposalData.key === proposalType
        ? parsedProposalData.kind.options
        : [];

    return parsedParams[0].map((param: string) => {
      const idx = Number(param);
      return proposalOptions[idx].description;
    });
  } catch (e) {
    return null;
  }
}
