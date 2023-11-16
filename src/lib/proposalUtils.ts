import * as theme from "@/styles/theme";

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
      return hasParams ? "FOR" : "AGAINST";
    case 1:
      return hasParams ? "ABSTAIN" : "FOR";
    case 2:
      return "AGAINST";
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

/**
 * Proposal title extraction
 */

const extractTitle = (body: string | undefined): string | null => {
  if (!body) return null;
  const hashResult = body.match(/^\s*#{1,6}\s+([^\n]+)/);
  if (hashResult) {
    return hashResult[1];
  }

  const equalResult = body.match(/^\s*([^\n]+)\n(={3,25}|-{3,25})/);
  if (equalResult) {
    return equalResult[1];
  }

  const textResult = body.match(/^\s*([^\n]+)\s*/);
  if (textResult) {
    return textResult[1];
  }

  return null;
};

const removeBold = (text: string | null): string | null =>
  text ? text.replace(/\*\*/g, "") : text;

const removeItalics = (text: string | null): string | null =>
  text ? text.replace(/__/g, "") : text;

export function getTitleFromProposalDescription(description: string = "") {
  const normalizedDescription = description
    .replace(/\\n/g, "\n")
    .replace(/(^['"]|['"]$)/g, "");

  return (
    removeItalics(removeBold(extractTitle(normalizedDescription)))?.trim() ??
    "Untitled"
  );
}

/**
 * Extract proposal total value
 */

type ProposalData = {
  STANDARD: {
    key: "STANDARD";
    kind: {
      targets: string;
      values: string;
      signatures: string;
      calldatas: string;
    };
  };
  // [options, settings]
  // options: [targets[], values[], calldatas[], description]
  // settings: [maxApprovals, criteria, budgetToken, criteriaValue, budgetAmount
  APPROVAL: {
    key: "APPROVAL";
    kind: [
      [string[], string[], string[], string][],
      [string, string, string, string, string]
    ];
  };
};

export function getProposalTotalValue(
  proposalData: ProposalData["STANDARD"] | ProposalData["APPROVAL"]
) {
  switch (proposalData.key) {
    case "STANDARD": {
      return (JSON.parse(proposalData.kind.values) as string[]).reduce(
        (acc, val) => {
          return acc + BigInt(val);
        },
        0n
      );
    }
    case "APPROVAL": {
      return proposalData.kind[0].reduce((acc, option) => {
        const values = option[1] as string[];
        return values.reduce((sum, val) => {
          return BigInt(val) + sum;
        }, 0n);
      }, 0n);
    }
  }
}
