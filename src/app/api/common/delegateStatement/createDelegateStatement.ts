import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
import { createDelegateStatementMessage } from "@/lib/delegateStatement/messageFormat";
import {
  DELEGATE_STATEMENT_SIWE_SIGNATURE_MARKER,
  buildStoredDelegateStatementPayload,
  getDelegateStatementPayloadHash,
} from "@/lib/delegateStatement/persistence";
import { verifyJwtAndGetAddress } from "@/lib/siweAuth.server";
import type { DelegateStatementAuthPayload } from "@/lib/delegateStatement/auth";

export async function createDelegateStatement({
  address,
  delegateStatement,
  scwAddress,
  auth,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  scwAddress?: string;
  auth: DelegateStatementAuthPayload;
}) {
  const { twitter, warpcast, discord, email, notificationPreferences } =
    delegateStatement;
  const { slug } = Tenant.current();
  const normalizedAddress = address.toLowerCase();

  if (auth.kind === "siwe_jwt") {
    const verifiedAddress = await verifyJwtAndGetAddress(auth.jwt);

    if (
      !verifiedAddress ||
      verifiedAddress.toLowerCase() !== normalizedAddress
    ) {
      throw new Error("Invalid token");
    }
  } else {
    const expectedMessage = createDelegateStatementMessage(delegateStatement, {
      daoSlug: slug,
      discord,
      email,
      twitter,
      warpcast,
      topIssues: delegateStatement.topIssues,
      topStakeholders: delegateStatement.topStakeholders,
      scwAddress,
      notificationPreferences,
    });

    const valid = await verifyMessage({
      address,
      chainId: auth.chainId,
      message: expectedMessage,
      signature: auth.signature,
      allowSafeContractSignature: true,
    });

    if (!valid) {
      throw new Error("Invalid signature");
    }
  }

  const storedPayload = buildStoredDelegateStatementPayload(delegateStatement);
  const messageHash = getDelegateStatementPayloadHash(storedPayload);

  const data: any = {
    address: normalizedAddress,
    dao_slug: slug,
    message_hash: messageHash,
    signature:
      auth.kind === "siwe_jwt"
        ? DELEGATE_STATEMENT_SIWE_SIGNATURE_MARKER
        : auth.signature,
    payload: storedPayload as Prisma.InputJsonValue,
    twitter,
    warpcast,
    discord,
    scw_address: scwAddress?.toLowerCase(),
    notification_preferences: {
      ...notificationPreferences,
      last_updated: new Date().toISOString(),
    },
  };

  // Only include email if it's not empty
  if (email && email.trim() !== "") {
    data.email = email;
  }

  return prismaWeb2Client.delegateStatements.upsert({
    where: {
      address_dao_slug_message_hash: {
        address: normalizedAddress,
        dao_slug: slug,
        message_hash: messageHash,
      },
    },
    update: data,
    create: data,
  });
}
