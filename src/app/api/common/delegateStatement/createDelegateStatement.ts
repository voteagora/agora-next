import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
import { sanitizeContent } from "@/lib/sanitizationUtils";

export async function createDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
  scwAddress,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
  scwAddress?: string;
}) {
  const { twitter, warpcast, discord, email, notificationPreferences } =
    delegateStatement;
  const { slug } = Tenant.current();

  const valid = await verifyMessage({
    address,
    message,
    signature,
  });

  if (!valid) {
    throw new Error("Invalid signature");
  }

  // Sanitize the statement before storing
  const sanitizedStatement = {
    ...delegateStatement,
    delegateStatement: sanitizeContent(delegateStatement.delegateStatement),
  };

  const data = {
    address: address.toLowerCase(),
    dao_slug: slug,
    signature,
    payload: sanitizedStatement as Prisma.InputJsonValue,
    twitter,
    warpcast,
    discord,
    email,
    scw_address: scwAddress?.toLowerCase(),
    notification_preferences: {
      ...notificationPreferences,
      last_updated: new Date().toISOString(),
    },
  };

  return prismaWeb2Client.delegateStatements.upsert({
    where: {
      address_dao_slug: {
        address: address.toLowerCase(),
        dao_slug: slug,
      },
    },
    update: data,
    create: data,
  });
}
