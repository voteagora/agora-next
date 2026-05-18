import { createServerFn } from "@tanstack/react-start";
import type { FormState } from "@/app/types";

const _serverCreateDraftProposal = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { onSubmitAction: fn } = await import(
      "@/app/proposals/draft/actions/createDraftProposal"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fn(data as any);
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onSubmitAction = (data: any): Promise<FormState> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverCreateDraftProposal({ data }) as any;
