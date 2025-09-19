"use server";

import { z } from "zod";
import { schema as RequestSponsorshipSchema } from "../schemas/requestSponsorshipSchema";
import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyOwnerAndSiweForDraft } from "./siweAuth";

export async function onSubmitAction(
  data: z.output<typeof RequestSponsorshipSchema> & {
    draftProposalId: number;
    creatorAddress: string;
    message: string;
    signature: `0x${string}`;
  }
): Promise<FormState> {
  const ownerCheck = await verifyOwnerAndSiweForDraft(data.draftProposalId, {
    address: data.creatorAddress as `0x${string}`,
    message: data.message,
    signature: data.signature,
  });
  if (!ownerCheck.ok) {
    return { ok: false, message: ownerCheck.reason };
  }

  const parsed = RequestSponsorshipSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  try {
    await prismaWeb2Client.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        sponsor_address: parsed.data.sponsor_address,
      },
    });

    return {
      ok: true,
      message: "Success!",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error adding sponsor to proposal.",
    };
  }
}
