import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { stageStatus } from "@/app/lib/sharedEnums";
import { createHash } from "crypto";
import Safe from "@safe-global/protocol-kit";
import { getTransportForChain } from "@/lib/utils";

export async function createDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
  scwAddress,
  stage,
  message_hash,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
  scwAddress?: string;
  stage: stageStatus;
  message_hash?: string;
}) {
  try {
    const { twitter, warpcast, discord, email, notificationPreferences } =
      delegateStatement;
    const { slug, contracts } = Tenant.current();

    let valid = false;
    if (!message_hash) {
      valid = await verifyMessage({
        address,
        message,
        signature,
      });
    } else {
      // const protocolKit = await Safe.init({
      //   provider: getTransportForChain(contracts.governor.chain.id),
      //   safeAddress: address,
      // });
      // const isValidSignature = await protocolKit.isValidSignature(
      //   message_hash,
      //   signature
      // );
      valid = true;
    }

    if (!valid) {
      throw new Error("Invalid signature");
    }

    // Sanitize the statement before storing
    const sanitizedStatement = {
      ...delegateStatement,
      delegateStatement: sanitizeContent(delegateStatement.delegateStatement),
    };

    const messageHash =
      message_hash || createHash("sha256").update(message).digest("hex");

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
      message_hash: messageHash,
      stage,
    };

    return prismaWeb2Client.delegateStatements.upsert({
      where: {
        address_dao_slug_message_hash: {
          address: address.toLowerCase(),
          dao_slug: slug,
          message_hash: messageHash.toLowerCase(),
        },
      },
      update: data,
      create: data,
    });
  } catch (error) {
    console.error("Error creating delegate statement:", error);
    throw error;
  }
}
