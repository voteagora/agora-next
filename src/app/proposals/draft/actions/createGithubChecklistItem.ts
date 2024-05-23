"use server";

import prisma from "@/app/lib/prisma";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(data: {
  link: string;
  draftProposalId: number;
  creatorAddress: string;
}): Promise<FormState> {
  try {
    await prisma.proposalChecklist.create({
      data: {
        title: "Docs updated",
        completed_by: data.creatorAddress,
        proposal: {
          connect: {
            id: data.draftProposalId,
          },
        },
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
      message: "Error saving draft proposal",
    };
  }
}
