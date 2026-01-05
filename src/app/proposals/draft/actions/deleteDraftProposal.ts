"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import {
  verifyOwnerAndSiweForDraft,
  verifyOwnerAndJwtForDraft,
} from "./siweAuth";

export async function onSubmitAction(
  draftProposalId: number,
  params: {
    address: `0x${string}`;
    message?: string;
    signature?: `0x${string}`;
    jwt?: string;
  }
): Promise<FormState> {
  try {
    if (params.jwt) {
      const jwtCheck = await verifyOwnerAndJwtForDraft(
        draftProposalId,
        params.jwt
      );
      if (!jwtCheck.ok) {
        return { ok: false, message: jwtCheck.reason };
      }
    } else if (params.message && params.signature) {
      const ownerCheck = await verifyOwnerAndSiweForDraft(draftProposalId, {
        address: params.address,
        message: params.message,
        signature: params.signature,
      });
      if (!ownerCheck.ok) {
        return { ok: false, message: ownerCheck.reason };
      }
    } else {
      return { ok: false, message: "Missing authentication" };
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
