import {
  decodeCalldata,
  parseIfNecessary,
  parseMultipleStringsSeparatedByComma,
} from "@/lib/proposalUtils/parsers/shared";

export function parseStandardProposalData(
  proposalData: string,
  proposalType: "STANDARD" | "HYBRID_STANDARD",
  offChainProposalData?: any
) {
  const parsedProposalData = JSON.parse(proposalData);

  try {
    const calldatas: any = parseMultipleStringsSeparatedByComma(
      parseIfNecessary(parsedProposalData.calldatas)
    );
    const targets: any = parseMultipleStringsSeparatedByComma(
      parseIfNecessary(parsedProposalData.targets)
    );
    const values = parseIfNecessary(parsedProposalData.values);
    const signatures: any = parseMultipleStringsSeparatedByComma(
      parseIfNecessary(parsedProposalData.signatures)
    );
    const functionArgsName = decodeCalldata(calldatas);

    return {
      key: proposalType,
      kind: {
        options: [
          {
            targets,
            values,
            signatures,
            calldatas,
            functionArgsName,
          },
        ],
        calculationOptions: offChainProposalData?.calculation_options,
      },
    };
  } catch (error) {
    console.log(`Error parsing proposal calldatas: '${proposalData}'`, error);
    return {
      key: proposalType,
      kind: {
        options: [],
        calculationOptions: offChainProposalData?.calculation_options,
      },
    };
  }
}

export function parseOffchainStandardProposalData(proposalData: string) {
  const parsedProposalData = JSON.parse(proposalData);

  return {
    key: "OFFCHAIN_STANDARD" as const,
    kind: {
      options: [] as [],
      onchainProposalId: parsedProposalData.onchain_proposalid,
      created_attestation_hash: parsedProposalData.created_attestation_hash,
      cancelled_attestation_hash: parsedProposalData.cancelled_attestation_hash,
      calculationOptions: parsedProposalData.calculation_options,
    },
  };
}
