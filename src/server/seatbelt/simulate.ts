/*
 * TanStack Start createServerFn wrapper for generateProposalId in
 * @/lib/seatbelt/simulate.
 *
 * simulate.ts is server-only (Tenderly/ethers) and must not run in the client
 * bundle. Only generateProposalId is imported from client code.
 */

import { createServerFn } from "@tanstack/react-start";

import type { generateProposalId as _OrigGenerateProposalId } from "@/lib/seatbelt/simulate";

function toBigInt(value: bigint | string | number): bigint {
  return typeof value === "bigint" ? value : BigInt(value);
}

function normalizeBigIntArray(
  values: Array<bigint | string | number>
): bigint[] {
  return values.map(toBigInt);
}

const _serverGenerateProposalId = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      targets: string[];
      values: Array<bigint | string | number>;
      calldatas: string[];
      description: string;
      proposalType?: "basic" | "approval" | "optimistic";
      unformattedProposalData?: string;
      moduleAddress?: string;
    }) => data
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { generateProposalId: fn } = await import("@/lib/seatbelt/simulate");
    return fn({
      ...data,
      values: normalizeBigIntArray(data.values),
    });
  });

export const generateProposalId: typeof _OrigGenerateProposalId = async (
  input = {
    targets: [],
    values: [],
    calldatas: [],
    description: "",
    proposalType: "basic",
  }
) => {
  const result = await _serverGenerateProposalId({ data: input });
  return typeof result === "bigint" ? result : BigInt(result as string);
};
