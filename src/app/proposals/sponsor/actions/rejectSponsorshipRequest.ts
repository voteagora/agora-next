"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function ackSponsorshipRequest({
  address,
  proposalId,
  status,
}: {
  address: `0x${string}`;
  proposalId: string;
  status: "PENDING" | "REJECTED";
}) {
  await prisma.proposalDraftApprovedSponsors.update({
    where: {
      sponsor_address_proposal_id: {
        sponsor_address: address,
        proposal_id: parseInt(proposalId),
      },
    },
    data: {
      status,
    },
  });

  revalidatePath(`/proposals/sponsor/${proposalId}`);
}

export default ackSponsorshipRequest;
