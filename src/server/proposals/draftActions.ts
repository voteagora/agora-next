/**
 * TanStack Start createServerFn wrappers for draft proposal mutations.
 */
import { createServerFn } from "@tanstack/react-start";

import type { AuthParams } from "@/lib/auth/authHelpers";

// ─── deleteAllDraftProposals ──────────────────────────────────────────────────

type DeleteAllDraftProposalsParams = { address: `0x${string}` } & AuthParams;

const _serverDeleteAllDraftProposals = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteAllDraftProposalsParams) => data)
  .handler(async ({ data }) => {
    const { onSubmitAction: fn } = await import(
      "@/app/proposals/draft/actions/deleteAllDraftProposals"
    );
    return fn(data);
  });

export const onSubmitAction = (params: DeleteAllDraftProposalsParams) =>
  _serverDeleteAllDraftProposals({ data: params });
