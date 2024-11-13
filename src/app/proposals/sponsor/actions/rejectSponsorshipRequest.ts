"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function rejectSponsorshipRequest({
  address,
  proposalId,
}: {
  address: `0x${string}`;
  proposalId: string;
}) {
  await prisma.proposalDraftApprovedSponsors.update({
    where: {
      sponsor_address_proposal_id: {
        sponsor_address: address,
        proposal_id: parseInt(proposalId),
      },
    },
    data: {
      status: "REJECTED",
    },
  });

  revalidatePath(`/proposals/sponsor/${proposalId}`);
}

export default rejectSponsorshipRequest;
