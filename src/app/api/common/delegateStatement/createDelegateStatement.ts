import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { createHash } from "crypto";
import { stageStatus } from "@/app/lib/sharedEnums";

const { slug } = Tenant.current();

export async function createDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
  scwAddress,
  // used if wallet is multisig
  stage,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
  scwAddress?: string;
  stage?: stageStatus;
}) {
  const { twitter, warpcast, discord, email, notificationPreferences } =
    delegateStatement;

  const valid = await verifyMessage({
    address,
    message,
    signature,
  });

  if (!valid) {
    throw new Error("Invalid signature");
  }

  // Hash message for storage
  const messageHash = createHash("sha256").update(message).digest("hex");

  // Sanitize the statement before storing
  const sanitizedStatement = {
    ...delegateStatement,
    delegateStatement: sanitizeContent(delegateStatement.delegateStatement),
  };

  // Default stage to published
  stage = stage ?? stageStatus.PUBLISHED;

  const data = {
    address: address.toLowerCase(),
    dao_slug: slug,
    signature,
    message_hash: messageHash,
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
    stage,
  };

  // Only update a draft proposal (can only be one)
  if (stage === stageStatus.DRAFT) {
    return prismaWeb2Client.delegateStatements.upsert({
      where: {
        address_dao_slug_stage: {
          address: address.toLowerCase(),
          dao_slug: slug,
          stage: stage,
        },
      },
      update: data,
      create: data,
    });
  }

  // Otherwise create a new published proposal
  return prismaWeb2Client.delegateStatements.create({ data });
}

/** This function is used to update an existing draft statement.
 * This function is likely to transition a multisig delegate statement from 'draft' to 'published'.
 * @param ${address} address - The address of the delegate
 * @param ${daoSlug} daoSlug - slug of DAO site
 * */
const publishDelegateStatementDraft = ({ address }: { address: string }) => {
  try {
    return prismaWeb2Client.delegateStatements.update({
      where: {
        address_dao_slug_stage: {
          address: address.toLowerCase(),
          dao_slug: slug,
          stage: stageStatus.DRAFT, // Ensures we're only updating drafts
        },
      },
      data: {
        stage: stageStatus.PUBLISHED, // Transition to published
      },
    });
  } catch (error) {
    // Graceful error handling
    console.error("Error updating draft to published:", error);
    throw new Error("Could not publish the delegate statement draft.");
  }
};
