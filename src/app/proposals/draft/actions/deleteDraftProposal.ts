"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyOwnerAndJwtForDraft } from "./siweAuth";

export async function onSubmitAction(
  draftProposalId: number,
  params: {
    address: `0x${string}`;
    jwt: string;
  }
): Promise<FormState> {
  try {
    if (!params.jwt) {
      return { ok: false, message: "Missing authentication" };
    }
    const jwtCheck = await verifyOwnerAndJwtForDraft(
      draftProposalId,
      params.jwt
    );
    if (!jwtCheck.ok) {
      return { ok: false, message: jwtCheck.reason };
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
    return {
      ok: false,
      message: "Error deleting draft proposal",
    };
  }
}
