"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyJwtAndGetAddress } from "./siweAuth";

export async function onSubmitAction(params: {
  address: `0x${string}`;
  jwt: string;
}): Promise<FormState & { deletedCount?: number }> {
  try {
    if (!params.jwt) {
      return { ok: false, message: "Missing authentication" };
    }
    const verifiedAddress = await verifyJwtAndGetAddress(params.jwt);
    if (!verifiedAddress) {
      return { ok: false, message: "Invalid token" };
    }
    if (verifiedAddress.toLowerCase() !== params.address.toLowerCase()) {
      return { ok: false, message: "Address mismatch" };
    }

    const result = await prismaWeb2Client.proposalDraft.deleteMany({
      where: {
        author_address: verifiedAddress,
      },
    });

    return {
      ok: true,
      message: "Success!",
      deletedCount: result.count,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error deleting draft proposals",
    };
  }
}
