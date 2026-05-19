/**
 * TanStack Start createServerFn wrapper for dao-node server-client functions.
 *
 * src/app/lib/dao-node/server-client.ts has "use server" and is stubbed to
 * undefined in the client bundle. Any isomorphic utility (e.g. votingPowerUtils)
 * that needs getDelegateVotingPowerFromDaoNode must go through this wrapper.
 *
 * Vite alias: "@/app/lib/dao-node/server-client" → this file.
 */
import { createServerFn } from "@tanstack/react-start";

import type { getDelegateVotingPowerFromDaoNode as _OrigFn } from "@/app/lib/dao-node/server-client";

const _serverGetDelegateVotingPower = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { getDelegateVotingPowerFromDaoNode: fn } = await import(
      "@/app/lib/dao-node/server-client"
    );
    return fn(data.address);
  });

export const getDelegateVotingPowerFromDaoNode: typeof _OrigFn = (address) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverGetDelegateVotingPower({ data: { address } }) as any;
