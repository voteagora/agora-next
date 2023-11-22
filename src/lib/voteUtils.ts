/**
 * Parse vote params
 */

import { ProposalType } from "@prisma/client";
import { ParsedProposalData, parseProposalData } from "./proposalUtils";

type ParsedParams = {
  APPROVAL: {
    key: "APPROVAL";
    kind: string[];
  };
  STANDARD: {
    key: "STANDARD";
    kind: null;
  };
};

export function parseParams(
  params: string | null,
  proposaData: ParsedProposalData[ProposalType]
): ParsedParams[ProposalType]["kind"] {
  if (params === null || proposaData.key !== "APPROVAL") {
    return null;
  }

  try {
    const parsedParams = JSON.parse(params);
    return parsedParams[0].map((param: string) => {
      const idx = Number(param);
      return proposaData.kind.options[idx].description;
    });
  } catch (e) {
    return null;
  }
}
