"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyOwnerAndSiweForDraft } from "./siweAuth";

// TODO: need to auth this route in some way
// perhaps send down the owner address and a signature + nonce to verify
export async function onSubmitAction(
  draftProposalId: number,
  params: {
    address: `0x${string}`;
    message: string;
    signature: `0x${string}`;
  }
): Promise<FormState> {
  try {
    const ownerCheck = await verifyOwnerAndSiweForDraft(draftProposalId, {
      address: params.address,
      message: params.message,
      signature: params.signature,
    });
    if (!ownerCheck.ok) {
      return { ok: false, message: ownerCheck.reason };
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
