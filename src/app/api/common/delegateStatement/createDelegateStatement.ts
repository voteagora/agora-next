import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { createHash } from "crypto";
import { createDelegateStatementMessage } from "@/lib/delegateStatement/messageFormat";

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
  const { twitter, warpcast, discord, email } = delegateStatement;
  const { slug } = Tenant.current();

  // Regenerate expected message from form data and compare
  const expectedMessage = createDelegateStatementMessage(delegateStatement, {
    daoSlug: slug,
    discord,
    email,
    twitter,
    warpcast,
    topIssues: delegateStatement.topIssues,
    topStakeholders: delegateStatement.topStakeholders,
    scwAddress,
  });

  // Verify signature against the message
  const valid = await verifyMessage({
    address,
    message: expectedMessage,
    signature,
  });

  if (!valid) {
    throw new Error("Invalid signature");
  }

  // Sanitize the statement before storing and remove email from payload
  const { email: _, ...delegateStatementWithoutEmail } = delegateStatement;
  const sanitizedStatement = {
    ...delegateStatementWithoutEmail,
    delegateStatement: sanitizeContent(delegateStatement.delegateStatement),
  };

  const stopGapMessageHash = createHash("sha256")
    .update(sanitizedStatement.delegateStatement)
    .digest("hex");

  const data: any = {
    address: address.toLowerCase(),
    dao_slug: slug,
    message_hash: stopGapMessageHash,
    signature,
    payload: sanitizedStatement as Prisma.InputJsonValue,
    twitter,
    warpcast,
    discord,
    scw_address: scwAddress?.toLowerCase(),
    notification_preferences: Prisma.DbNull,
  };

  // Only include email if it's not empty
  if (email && email.trim() !== "") {
    data.email = email;
  }

  return prismaWeb2Client.delegateStatements.upsert({
    where: {
      address_dao_slug_message_hash: {
        address: address.toLowerCase(),
        dao_slug: slug,
        message_hash: stopGapMessageHash,
      },
    },
    update: data,
    create: data,
  });
}
