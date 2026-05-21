/*
 * TanStack Start createServerFn wrappers for @/lib/seatbelt/checkProposal.
 *
 * checkProposal.ts has "use server" and is stubbed to undefined in the client
 * bundle. Client components that run Tenderly simulations must import from here.
 */

import { createServerFn } from "@tanstack/react-start";

import type {
  checkNewProposal as _OrigCheckNewProposal,
  checkExistingProposal as _OrigCheckExistingProposal,
  checkNewApprovalProposal as _OrigCheckNewApprovalProposal,
} from "@/lib/seatbelt/checkProposal";

import type {
  ApprovalProposalOption,
  ApprovalProposalSettings,
} from "@/lib/seatbelt/types";

function toBigInt(value: bigint | string | number): bigint {
  return typeof value === "bigint" ? value : BigInt(value);
}

function normalizeBigIntArray(
  values: Array<bigint | string | number>
): bigint[] {
  return values.map(toBigInt);
}

function normalizeApprovalOptions(
  options: ApprovalProposalOption[]
): ApprovalProposalOption[] {
  return options.map((option) => ({
    ...option,
    budgetTokensSpent: toBigInt(option.budgetTokensSpent),
    values: normalizeBigIntArray(option.values),
  }));
}

function normalizeApprovalSettings(
  settings: ApprovalProposalSettings
): ApprovalProposalSettings {
  return {
    ...settings,
    criteriaValue: toBigInt(settings.criteriaValue),
    budgetAmount: toBigInt(settings.budgetAmount),
  };
}

const _serverCheckNewProposal = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      targets: string[];
      values: Array<bigint | string | number>;
      signatures: string[];
      calldatas: string[];
      draftId: string;
      title?: string;
    }) => data
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { checkNewProposal: fn } = await import(
      "@/lib/seatbelt/checkProposal"
    );
    return fn({
      ...data,
      values: normalizeBigIntArray(data.values),
    });
  });

export const checkNewProposal: typeof _OrigCheckNewProposal = (input) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverCheckNewProposal({ data: input }) as any;

const _serverCheckExistingProposal = createServerFn({ method: "POST" })
  .inputValidator(
    (data: Parameters<typeof _OrigCheckExistingProposal>[0]) => data
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { checkExistingProposal: fn } = await import(
      "@/lib/seatbelt/checkProposal"
    );
    return fn(data);
  });

export const checkExistingProposal: typeof _OrigCheckExistingProposal = (
  input
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverCheckExistingProposal({ data: input }) as any;

const _serverCheckNewApprovalProposal = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      unformattedProposalData: `0x${string}`;
      description: string;
      draftId: string;
      title?: string;
      options: ApprovalProposalOption[];
      settings: ApprovalProposalSettings;
      combination?: number[];
      totalNumOfOptions?: number;
    }) => data
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { checkNewApprovalProposal: fn } = await import(
      "@/lib/seatbelt/checkProposal"
    );
    return fn({
      ...data,
      options: normalizeApprovalOptions(data.options),
      settings: normalizeApprovalSettings(data.settings),
    });
  });

export const checkNewApprovalProposal: typeof _OrigCheckNewApprovalProposal = (
  input
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverCheckNewApprovalProposal({ data: input }) as any;
