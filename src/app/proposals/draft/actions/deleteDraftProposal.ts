"use server";

import prisma from "@/app/lib/prisma";

export type FormState = {
  ok: boolean;
  message: string;
};

// TODO: need to auth this route in some way
// perhaps send down the owner address and a signature + nonce to verify
export async function onSubmitAction(
  draftProposalId: number
): Promise<FormState> {
  try {
    // TODO: maybe we don't delete, we just flag isDeleted
    await prisma.proposalDraft.delete({
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
