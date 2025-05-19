"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@/app/lib/sharedEnums";
import SafeApiKit from "@safe-global/api-kit";
import { revalidateTag } from "next/cache";
import { revalidateDelegateAddressPage } from "@/app/delegates/actions";

export async function publishDelegateStatement({
  message_hash,
  chain_id,
}: {
  message_hash: string;
  chain_id: number;
}) {
  const tenant = Tenant.current();
  const apiKit = new SafeApiKit({
    chainId: BigInt(chain_id),
  });

  const message = await apiKit.getMessage(message_hash);
  const safeInfo = await apiKit.getSafeInfo(message.safe);

  if (!safeInfo) {
    throw new Error("Safe not found");
  }

  if (safeInfo?.threshold <= message.confirmations.length) {
    revalidateTag(
      `delegateStatement-${message.safe.toLowerCase()}-${stageStatus.DRAFT}`
    );
    revalidateDelegateAddressPage(message.safe.toLowerCase());
    return prismaWeb2Client.delegateStatements
      .update({
        where: {
          address_dao_slug_message_hash: {
            address: message.safe.toLowerCase(),
            dao_slug: tenant.slug,
            message_hash: message_hash,
          },
        },
        data: {
          stage: stageStatus.PUBLISHED,
        },
      })
      .catch((error) => console.error(error));
  } else {
    throw new Error("Awaiting signatures");
  }
}
