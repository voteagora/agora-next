/**
 * TanStack Start createServerFn wrapper for paymaster data fetching.
 */
import { createServerFn } from "@tanstack/react-start";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _serverFetchPaymasterData = createServerFn({ method: "POST" })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .inputValidator((data: any) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchPaymasterData: fn } = await import(
      "@/app/api/paymaster/fetchPaymasterData"
    );
    return fn(data);
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchPaymasterData = (params: any): Promise<`0x${string}`> =>
  _serverFetchPaymasterData({ data: params }) as Promise<`0x${string}`>;
