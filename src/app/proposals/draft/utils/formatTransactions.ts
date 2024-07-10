import { parseProposalData } from "@/lib/proposalUtils";
import { ProposalDraftTransaction } from "@prisma/client";

export const formatTransactions = (
  transactions: ProposalDraftTransaction[]
) => {
  const aggregatedTransactions = transactions.reduce(
    (acc, transaction) => {
      acc["targets"] = [...acc["targets"], transaction.target];
      acc["values"] = [...acc["values"], transaction.value];
      acc["calldatas"] = [...acc["calldatas"], transaction.calldata];
      acc["signatures"] = [...acc["signatures"], ""];

      return acc;
    },
    { targets: [], calldatas: [], values: [], signatures: [] } as {
      targets: string[];
      calldatas: string[];
      values: string[];
      signatures: string[];
    }
  );

  const stringifiedTransactions = JSON.stringify({
    targets: JSON.stringify(aggregatedTransactions.targets),
    calldatas: JSON.stringify(aggregatedTransactions.calldatas),
    values: JSON.stringify(aggregatedTransactions.values),
    signatures: JSON.stringify(aggregatedTransactions.signatures),
  });

  const parsedTransactions = parseProposalData(
    stringifiedTransactions,
    "STANDARD"
  );

  return parsedTransactions;
};
