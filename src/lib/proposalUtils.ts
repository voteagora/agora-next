import * as theme from "@/lib/theme";

export function parseProposalType(
  proposalData: string
): "STANDARD" | "APPROVAL" {
  const data = JSON.parse(proposalData);
  if (Array.isArray(data)) {
    return "APPROVAL";
  }
  return "STANDARD";
}

export function parseSupport(support: string | null, hasParams: boolean) {
  switch (Number(support)) {
    case 0:
      return hasParams ? 1 : -1; // FOR / AGAINST
    case 1:
      return hasParams ? 0 : 1; // ABSTAIN / FOR
    case 2:
      return -1;
  }
}

export function parseParams(
  params: string | null,
  proposaData: string | null
): string[] | null {
  if (params === null) {
    return null;
  }

  try {
    const parsedParams = JSON.parse(params);
    const parsedProposalData = JSON.parse(proposaData ?? "[]");
    const proposalOptions = parsedProposalData[0];

    return parsedParams[0].map((param: string) => {
      const idx = Number(param);
      return proposalOptions[idx][3];
    });
  } catch (e) {
    return null;
  }
}

export function colorForSupportType(
  supportType: "AGAINST" | "ABSTAIN" | "FOR"
) {
  switch (supportType) {
    case "AGAINST":
      return theme.colors.red["700"];

    case "ABSTAIN":
      return theme.colors.gray["700"];

    case "FOR":
      return theme.colors.green["700"];
  }
}
