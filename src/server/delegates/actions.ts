/**
 * TanStack Start createServerFn wrappers for Next.js "use server" delegate actions.
 *
 * Client components import from here instead of @/app/delegates/actions so the
 * server-only implementations (Prisma, next/cache, authHelpers) never end up in
 * the browser bundle.
 *
 * Each wrapper preserves the original function signature so call sites don't change —
 * only the import path needs updating.
 *
 * Return types are expressed via `import type` from the original module so TypeScript
 * stays accurate. Internally we cast through `any` because Prisma's Decimal/bigint
 * types fail TanStack's ValidateSerializable check even though they do serialize
 * correctly at runtime (BigInt.prototype.toJSON + Decimal.toJSON are both wired up).
 */
import { createServerFn } from "@tanstack/react-start";

import type {
  fetchDirectDelegatee as _OrigFetchDirectDelegatee,
  fetchBalanceForDirectDelegation as _OrigFetchBalanceForDirectDelegation,
  fetchCurrentDelegatees as _OrigFetchCurrentDelegatees,
  fetchAllForAdvancedDelegation as _OrigFetchAllForAdvancedDelegation,
  submitDelegateStatement as _OrigSubmitDelegateStatement,
  updateNotificationPreferencesForAddress as _OrigUpdateNotificationPreferences,
  fetchDelegateStatement as _OrigFetchDelegateStatement,
  fetchDelegate as _OrigFetchDelegate,
  fetchConnectedDelegate as _OrigFetchConnectedDelegate,
  fetchVoterStats as _OrigFetchVoterStats,
  fetchDelegateStats as _OrigFetchDelegateStats,
  fetchArchiveParticipation as _OrigFetchArchiveParticipation,
  revalidateDelegateAddressPage as _OrigRevalidateDelegateAddressPage,
} from "@/app/delegates/actions";

import type { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import type { DelegateStatementAuthPayload } from "@/lib/delegateStatement/auth";
import type { AuthParams } from "@/lib/auth/authHelpers";

// ─── fetchDirectDelegatee ─────────────────────────────────────────────────────

const _serverFetchDirectDelegatee = createServerFn({ method: "GET" })
  .inputValidator((data: { addressOrENSName: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchDirectDelegatee: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.addressOrENSName);
  });

export const fetchDirectDelegatee: typeof _OrigFetchDirectDelegatee = (
  addressOrENSName
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchDirectDelegatee({ data: { addressOrENSName } }) as any;

// ─── fetchBalanceForDirectDelegation ──────────────────────────────────────────

const _serverFetchBalanceForDirectDelegation = createServerFn({
  method: "GET",
})
  .inputValidator((data: { addressOrENSName: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchBalanceForDirectDelegation: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.addressOrENSName);
  });

export const fetchBalanceForDirectDelegation: typeof _OrigFetchBalanceForDirectDelegation =
  (addressOrENSName) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _serverFetchBalanceForDirectDelegation({
      data: { addressOrENSName },
    }) as any;

// ─── fetchCurrentDelegatees ───────────────────────────────────────────────────

const _serverFetchCurrentDelegatees = createServerFn({ method: "GET" })
  .inputValidator((data: { addressOrENSName: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchCurrentDelegatees: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.addressOrENSName);
  });

export const fetchCurrentDelegatees: typeof _OrigFetchCurrentDelegatees = (
  addressOrENSName
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchCurrentDelegatees({ data: { addressOrENSName } }) as any;

// ─── fetchAllForAdvancedDelegation ────────────────────────────────────────────

const _serverFetchAllForAdvancedDelegation = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchAllForAdvancedDelegation: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.address);
  });

export const fetchAllForAdvancedDelegation: typeof _OrigFetchAllForAdvancedDelegation =
  (address) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _serverFetchAllForAdvancedDelegation({ data: { address } }) as any;

// ─── submitDelegateStatement ──────────────────────────────────────────────────

type SubmitDelegateStatementParams = {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  scwAddress?: string;
  auth: DelegateStatementAuthPayload;
};

const _serverSubmitDelegateStatement = createServerFn({ method: "POST" })
  .inputValidator((data: SubmitDelegateStatementParams) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { submitDelegateStatement: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data);
  });

export const submitDelegateStatement: typeof _OrigSubmitDelegateStatement = (
  params
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverSubmitDelegateStatement({ data: params as any }) as any;

// ─── updateNotificationPreferencesForAddress ──────────────────────────────────

type NotificationOptions = {
  wants_proposal_created_email: "prompt" | "prompted" | true | false;
  wants_proposal_ending_soon_email: "prompt" | "prompted" | true | false;
};

type UpdateNotificationParams = {
  address: `0x${string}`;
  email: string;
  options: NotificationOptions;
  auth: AuthParams;
};

const _serverUpdateNotificationPreferences = createServerFn({
  method: "POST",
})
  .inputValidator((data: UpdateNotificationParams) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { updateNotificationPreferencesForAddress: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.address, data.email, data.options, data.auth);
  });

export const updateNotificationPreferencesForAddress: typeof _OrigUpdateNotificationPreferences =
  (address, email, options, auth) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _serverUpdateNotificationPreferences({
      data: { address, email, options, auth },
    }) as any;

// ─── fetchDelegateStatement ───────────────────────────────────────────────────

const _serverFetchDelegateStatement = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchDelegateStatement: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.address);
  });

export const fetchDelegateStatement: typeof _OrigFetchDelegateStatement = (
  address
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchDelegateStatement({ data: { address } }) as any;

// ─── fetchDelegate ────────────────────────────────────────────────────────────

const _serverFetchDelegate = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchDelegate: fn } = await import("@/app/delegates/actions");
    return fn(data.address);
  });

export const fetchDelegate: typeof _OrigFetchDelegate = (address) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchDelegate({ data: { address } }) as any;

// ─── fetchConnectedDelegate ───────────────────────────────────────────────────

const _serverFetchConnectedDelegate = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchConnectedDelegate: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.address);
  });

export const fetchConnectedDelegate: typeof _OrigFetchConnectedDelegate = (
  address
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchConnectedDelegate({ data: { address } }) as any;

// ─── fetchVoterStats ──────────────────────────────────────────────────────────

const _serverFetchVoterStats = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchVoterStats: fn } = await import("@/app/delegates/actions");
    return fn(data.address);
  });

export const fetchVoterStats: typeof _OrigFetchVoterStats = (address) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchVoterStats({ data: { address } }) as any;

// ─── fetchDelegateStats ───────────────────────────────────────────────────────

const _serverFetchDelegateStats = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchDelegateStats: fn } = await import("@/app/delegates/actions");
    return fn(data.address);
  });

export const fetchDelegateStats: typeof _OrigFetchDelegateStats = (address) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchDelegateStats({ data: { address } }) as any;

// ─── fetchArchiveParticipation ────────────────────────────────────────────────

const _serverFetchArchiveParticipation = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchArchiveParticipation: fn } = await import(
      "@/app/delegates/actions"
    );
    return fn(data.address);
  });

export const fetchArchiveParticipation: typeof _OrigFetchArchiveParticipation =
  (address) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _serverFetchArchiveParticipation({ data: { address } }) as any;

// ─── revalidateDelegateAddressPage ────────────────────────────────────────────
// In TanStack Start there is no Next.js incremental cache to revalidate.
// This is a no-op so call sites that still import the symbol don't break.

export const revalidateDelegateAddressPage: typeof _OrigRevalidateDelegateAddressPage =
  async (_delegateAddress) => {
    // no-op in TanStack Start
  };
