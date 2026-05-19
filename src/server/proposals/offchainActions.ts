import { createServerFn } from "@tanstack/react-start";
import type {
  createOffchainProposal as _CreateOffchainProposal,
  cancelOffchainProposal as _CancelOffchainProposal,
} from "@/app/api/offchain-proposals/actions";

const _serverCreateOffchainProposal = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }): Promise<any> => {
    const { createOffchainProposal } = await import(
      "@/app/api/offchain-proposals/actions"
    );
    return createOffchainProposal(data as any);
  });

export const createOffchainProposal: typeof _CreateOffchainProposal = (
  params
) => _serverCreateOffchainProposal({ data: params as any }) as any;

const _serverCancelOffchainProposal = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }): Promise<any> => {
    const { cancelOffchainProposal } = await import(
      "@/app/api/offchain-proposals/actions"
    );
    return cancelOffchainProposal(data as any);
  });

export const cancelOffchainProposal: typeof _CancelOffchainProposal = (
  params
) => _serverCancelOffchainProposal({ data: params as any }) as any;
