import { createServerFn } from "@tanstack/react-start";
import type { AuthParams } from "@/lib/auth/authHelpers";
import type { FormState } from "@/app/types";

type DeleteDraftParams = {
  draftProposalId: number;
  address: `0x${string}`;
} & AuthParams;

const _serverDeleteDraftProposal = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteDraftParams) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { onSubmitAction: fn } = await import(
      "@/app/proposals/draft/actions/deleteDraftProposal"
    );
    return fn(data.draftProposalId, data);
  });

export const onSubmitAction = (
  draftProposalId: number,
  params: { address: `0x${string}` } & AuthParams
): Promise<FormState> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverDeleteDraftProposal({ data: { draftProposalId, ...params } }) as any;
