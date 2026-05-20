/**
 * TanStack Start createServerFn wrapper for sponsorDraftProposal.
 *
 * Vite alias: "@/app/proposals/draft/actions/sponsorDraftProposal" → this file.
 * The handler MUST NOT import from that path — it resolves back here and
 * causes infinite createServerFn recursion (server OOM). Import the real
 * "use server" implementation via a relative path instead.
 */
import { createServerFn } from "@tanstack/react-start";
import type { FormState } from "@/app/types";

const _serverSponsorDraftProposal = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { onSubmitAction: fn } = await import(
      "../../../app/proposals/draft/actions/sponsorDraftProposal"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fn(data as any);
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onSubmitAction = (data: any): Promise<FormState> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverSponsorDraftProposal({ data }) as any;
