"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@/app/lib/sharedEnums";
import { revalidateTag } from "next/cache";
const { slug } = Tenant.current();

export async function deleteDelegateStatement({
  address,
  messageHash,
}: {
  address: string;
  messageHash: string;
}) {
  revalidateTag(
    `delegateStatement-${address.toLowerCase()}-${stageStatus.DRAFT}`
  );
  return prismaWeb2Client.delegateStatements
    .delete({
      where: {
        address_dao_slug_message_hash: {
          address: address.toLowerCase(),
          dao_slug: slug,
          message_hash: messageHash,
        },
        stage: stageStatus.DRAFT,
      },
    })
    .catch((error) => console.error(error));
}
