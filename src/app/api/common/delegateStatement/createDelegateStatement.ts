import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { stageStatus } from "@/app/lib/sharedEnums";
import { createHash } from "crypto";
import SafeApiKit from "@safe-global/api-kit";
import { revalidateTag } from "next/cache";
import { revalidateDelegateAddressPage } from "@/app/delegates/actions";

export async function createDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
  scwAddress,
  message_hash,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
  scwAddress?: string;
  message_hash?: string;
}) {
  try {
    const { twitter, warpcast, discord, email, notificationPreferences } =
      delegateStatement;
    const { slug, contracts } = Tenant.current();
    const stage = message_hash ? stageStatus.DRAFT : stageStatus.PUBLISHED;
    let valid = false;
    if (!message_hash) {
      valid = await verifyMessage({
        address,
        message,
        signature,
      });
    } else {
      try {
        const apiKit = new SafeApiKit({
          chainId: contracts.governor.chain.id as any,
        });

        const safeMessage = await apiKit.getMessage(message_hash);
        if (safeMessage && safeMessage.preparedSignature === signature) {
          valid = true;
        } else {
          valid = false;
        }

        if (
          valid &&
          safeMessage.message &&
          typeof safeMessage.message === "string"
        ) {
          const parsedMessage = JSON.parse(safeMessage.message);
          delegateStatement = {
            ...delegateStatement,
            ...parsedMessage,
          };
        }
      } catch (safeApiError) {
        throw new Error("Could not verify Safe signature with Safe API");
      }
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

    if (stage === stageStatus.DRAFT) {
      revalidateTag(
        `delegateStatement-${address.toLowerCase()}-${stageStatus.DRAFT}`
      );
    }

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
