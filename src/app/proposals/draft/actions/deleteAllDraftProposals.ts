"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifySiwe, verifyJwtAndGetAddress } from "./siweAuth";

export async function onSubmitAction(params: {
  address: `0x${string}`;
  message?: string;
  signature?: `0x${string}`;
  jwt?: string;
}): Promise<FormState & { deletedCount?: number }> {
  try {
    let verifiedAddress: `0x${string}` | null = null;

    if (params.jwt) {
      verifiedAddress = await verifyJwtAndGetAddress(params.jwt);
      if (!verifiedAddress) {
        return { ok: false, message: "Invalid token" };
      }
      if (verifiedAddress.toLowerCase() !== params.address.toLowerCase()) {
        return { ok: false, message: "Address mismatch" };
      }
    } else if (params.message && params.signature) {
      const isValid = await verifySiwe({
        address: params.address,
        message: params.message,
        signature: params.signature,
      });
      if (!isValid) {
        return { ok: false, message: "Invalid signature" };
      }
      verifiedAddress = params.address;
    } else {
      return { ok: false, message: "Missing authentication" };
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
    console.log(error);
    return {
      ok: false,
      message: "Error deleting draft proposals",
    };
  }
}
