"use server";

import { z } from "zod";
import { schema as RequestSponsorshipSchema } from "../schemas/requestSponsorshipSchema";
import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import { requireDraftEditAccess } from "./draftAuthorization";

export async function onSubmitAction(
  data: z.output<typeof RequestSponsorshipSchema> & {
    draftProposalId: number;
    creatorAddress: string;
  } & AuthParams
): Promise<FormState> {
  const authResult = await verifyAuth(
    {
      jwt: data.jwt,
      message: data.message,
      signature: data.signature,
      address: data.creatorAddress as `0x${string}`,
    },
    data.creatorAddress as `0x${string}`
  );
  if (!authResult.success) {
    return { ok: false, message: authResult.error };
  }

  const draftAccess = await requireDraftEditAccess({
    draftProposalId: data.draftProposalId,
    address: authResult.address,
  });
  if (!draftAccess.ok) {
    return { ok: false, message: draftAccess.message };
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
