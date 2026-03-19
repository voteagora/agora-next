"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "../types";

export async function onSubmitAction(
  draftProposalId: number,
  params: { address: `0x${string}` } & AuthParams
): Promise<FormState> {
  try {
    const authResult = await verifyAuth(params, params.address);
    if (!authResult.success) {
      return { ok: false, message: authResult.error };
    }

    // Check draft ownership
    const draft = await prismaWeb2Client.proposalDraft.findUnique({
      where: { id: draftProposalId },
      select: { id: true, author_address: true },
    });

    if (!draft) {
      return { ok: false, message: "Draft not found" };
    }

    // Check if user is authorized (author or offchain proposal creator)
    const addressLower = authResult.address.toLowerCase();
    const authorLower = draft.author_address.toLowerCase();
    let isAuthorized = addressLower === authorLower;

    if (!isAuthorized) {
      const tenant = Tenant.current();
      const plmToggle = tenant.ui.toggle("proposal-lifecycle");
      const offchainCreators =
        (plmToggle?.config as PLMConfig)?.offchainProposalCreator || [];
      isAuthorized = offchainCreators.some(
        (creator) => creator.toLowerCase() === addressLower
      );
    }

    if (!isAuthorized) {
      return { ok: false, message: "Unauthorized" };
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
}
