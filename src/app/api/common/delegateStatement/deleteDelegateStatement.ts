import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@/app/lib/sharedEnums";
const { slug } = Tenant.current();

export async function deleteDelegateStatement({
  address,
  messageHash,
}: {
  address: `0x${string}`;
  messageHash: string;
}) {
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
