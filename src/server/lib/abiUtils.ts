/*
 * TanStack Start createServerFn wrapper for @/lib/abiUtils.
 *
 * abiUtils.ts has "use server" and is stubbed to undefined in the client
 * bundle. Client hooks (useContractAbi, useExecutionTxLogs) that need
 * cachedGetContractAbi must import from this wrapper instead.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { cachedGetContractAbi as _OrigCachedGetContractAbi } from "@/lib/abiUtils";

const _serverGetContractAbi = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({
        contractAddress: z.string(),
        etherscanApiKey: z.string(),
        network: z.string().optional(),
      })
      .parse.bind(
        z.object({
          contractAddress: z.string(),
          etherscanApiKey: z.string(),
          network: z.string().optional(),
        })
      )
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { cachedGetContractAbi: fn } = await import("@/lib/abiUtils");
    return fn(data.contractAddress, data.etherscanApiKey, data.network);
  });

export const cachedGetContractAbi: typeof _OrigCachedGetContractAbi = (
  contractAddress,
  etherscanApiKey,
  network
) =>
  _serverGetContractAbi({
    data: { contractAddress, etherscanApiKey, network },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
