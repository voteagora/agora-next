"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComment({
  proposalId,
  comment,
  address,
  parentId,
}: {
  proposalId: string;
  comment: string;
  address: `0x${string}`;
  parentId?: number;
}) {
  await prismaWeb2Client.proposalDraftComment.create({
    data: {
      proposal_id: parseInt(proposalId),
      comment,
      author: address,
      parent_id: parentId,
    },
  });

  revalidatePath(`/proposals/sponsor/${proposalId}`);
}
