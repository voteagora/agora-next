/*
 * TanStack Start createServerFn wrapper for @/lib/transactionDecoder.
 *
 * transactionDecoder.ts has "use server" and is stubbed to undefined in the
 * client bundle. Client hooks (useTransactionDecoding) that need
 * cachedDecodeEnhanced must import from this wrapper instead.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { cachedDecodeEnhanced as _OrigCachedDecodeEnhanced } from "@/lib/transactionDecoder";

const _serverDecodeEnhanced = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({
        target: z.string(),
        calldata: z.string(),
        etherscanApiKey: z.string(),
        network: z.string().optional(),
      })
      .parse.bind(
        z.object({
          target: z.string(),
          calldata: z.string(),
          etherscanApiKey: z.string(),
          network: z.string().optional(),
        })
      )
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { cachedDecodeEnhanced: fn } = await import(
      "@/lib/transactionDecoder"
    );
    return fn(data.target, data.calldata, data.etherscanApiKey, data.network);
  });

export const cachedDecodeEnhanced: typeof _OrigCachedDecodeEnhanced = (
  target,
  calldata,
  etherscanApiKey,
  network
) =>
  _serverDecodeEnhanced({
    data: { target, calldata, etherscanApiKey: etherscanApiKey ?? "", network },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
