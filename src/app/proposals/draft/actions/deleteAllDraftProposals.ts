"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import Tenant from "@/lib/tenant/tenant";

export async function onSubmitAction(
  params: { address: `0x${string}` } & AuthParams
): Promise<FormState & { deletedCount?: number }> {
  try {
    const authResult = await verifyAuth(params, params.address);
    if (!authResult.success) {
      return { ok: false, message: authResult.error };
    }
    const verifiedAddress = authResult.address.toLowerCase();

    const { slug } = Tenant.current();

    const result = await prismaWeb2Client.proposalDraft.deleteMany({
      where: {
        author_address: {
          equals: verifiedAddress,
          mode: "insensitive",
        },
        dao_slug: slug,
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
