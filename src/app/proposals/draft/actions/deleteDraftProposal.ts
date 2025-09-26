"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "../types";

export async function onSubmitAction(
  draftProposalId: number,
  message: string,
  signature: string
): Promise<FormState> {
  // Verify SIWE authentication
  try {
    const { requireSiweAuth } = await import("./siweAuth");
    const { address } = await requireSiweAuth(message, signature);
    
    // Verify ownership of the draft
    const draft = await prismaWeb2Client.proposalDraft.findUnique({
      where: { id: draftProposalId },
      select: { author_address: true },
    });
    
    if (!draft || !draft.author_address) {
      return {
        ok: false,
        message: "Draft not found",
      };
    }
    
    if (address.toLowerCase() !== draft.author_address.toLowerCase()) {
      return {
        ok: false,
        message: "Authentication failed: you are not the owner of this draft",
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      message: `Authentication failed: ${error.message}`,
    };
  }
  try {
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
