import {
  decodeCalldata,
  toApprovalVotingCriteria,
} from "@/lib/proposalUtils/parsers/shared";

export function parseApprovalProposalData(
  proposalData: string,
  proposalType: "APPROVAL" | "HYBRID_APPROVAL"
) {
  const parsedProposalData = JSON.parse(proposalData);
  const [maxApprovals, criteria, budgetToken, criteriaValue, budgetAmount] =
    parsedProposalData[1] as [string, string, string, string, string];

  return {
    key: proposalType,
    kind: {
      options: parsedProposalData[0].map((option: Array<string | string[]>) => {
        const [budgetTokensSpent, targets, values, calldatas, description] =
          (() => {
            if (option.length === 4) {
              return [
                null,
                option[0],
                option[1],
                option[2],
                option[3],
              ] as const;
            }

            if (option.length === 5) {
              return [
                option[0],
                option[1],
                option[2],
                option[3],
                option[4],
              ] as const;
            }

            throw new Error("unknown option length");
          })();

        const functionArgsName = decodeCalldata(calldatas as `0x${string}`[]);

        return {
          targets,
          values,
          calldatas,
          description,
          functionArgsName,
          budgetTokensSpent,
        };
      }),
      proposalSettings: {
        maxApprovals: Number(maxApprovals),
        criteria: toApprovalVotingCriteria(Number(criteria)),
        budgetToken,
        criteriaValue: BigInt(criteriaValue),
        budgetAmount: BigInt(budgetAmount),
      },
    },
  };
}

export function parseOffchainApprovalProposalData(proposalData: string) {
  const parsedProposalData = JSON.parse(proposalData);

  return {
    key: "OFFCHAIN_APPROVAL" as const,
    kind: {
      onchainProposalId: parsedProposalData.onchain_proposalid,
      choices: parsedProposalData.choices,
      options: [] as [],
      created_attestation_hash: parsedProposalData.created_attestation_hash,
      cancelled_attestation_hash: parsedProposalData.cancelled_attestation_hash,
    },
  };
}
