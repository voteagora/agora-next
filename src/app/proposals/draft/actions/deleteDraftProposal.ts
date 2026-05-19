"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import { requireDraftEditAccess } from "./draftAuthorization";
import { withServerActionMonitoring } from "@/lib/apiMonitoring";

export async function onSubmitAction(
  draftProposalId: number,
  params: { address: `0x${string}` } & AuthParams
): Promise<FormState> {
  return withServerActionMonitoring(
    "server_action.proposals.draft.delete",
    async () => {
      try {
        const authResult = await verifyAuth(params, params.address);
        if (!authResult.success) {
          return { ok: false, message: authResult.error };
        }

        const draftAccess = await requireDraftEditAccess({
          draftProposalId,
          address: authResult.address,
        });
        if (!draftAccess.ok) {
          return { ok: false, message: draftAccess.message };
        }
        // TODO: maybe we don't delete, we just flag isDeleted
        await prismaWeb2Client.proposalDraft.delete({
          where: {
            id: draftProposalId,
          },
        });

        return {
          ok: true,
          message: "Success!",
        };
      } catch (error) {
        console.log(error);
        return {
          ok: false,
          message: "Error deleting draft proposal",
        };
      }
    },
    { labels: { draftProposalId } }
  );
}
