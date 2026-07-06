import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
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
  const { twitter, warpcast, discord } = delegateStatement;
  const { slug, ui } = Tenant.current();
  const normalizedAddress = address.toLowerCase();
  const canManageProfileMetadata =
    ui.toggle("delegates/profile-metadata")?.enabled ?? false;

  const verifiedAddress = await verifyJwtAndGetAddress(auth.jwt);

  if (!verifiedAddress || verifiedAddress.toLowerCase() !== normalizedAddress) {
    throw new Error("Invalid token");
  }

  const storedPayload = buildStoredDelegateStatementPayload(delegateStatement);
  const messageHash = getDelegateStatementPayloadHash(storedPayload);

  const existingStatementMetadata =
    await prismaWeb2Client.delegateStatements.findFirst({
      where: { address: normalizedAddress, dao_slug: slug },
      orderBy: [{ updated_at_ts: "desc" }, { created_at_ts: "desc" }],
      select: {
        username: true,
        avatar: true,
      },
    });
  const normalizeProfileMetadata = (value?: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };

  const data: any = {
    address: normalizedAddress,
    username: canManageProfileMetadata
      ? normalizeProfileMetadata(delegateStatement.username)
      : (existingStatementMetadata?.username ?? undefined),
    avatar: canManageProfileMetadata
      ? normalizeProfileMetadata(delegateStatement.avatar)
      : (existingStatementMetadata?.avatar ?? undefined),
    dao_slug: slug,
    message_hash: messageHash,
    signature: DELEGATE_STATEMENT_SIWE_SIGNATURE_MARKER,
    payload: storedPayload as Prisma.InputJsonValue,
    twitter,
    warpcast,
    discord,
    scw_address: scwAddress?.toLowerCase(),
  };

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
