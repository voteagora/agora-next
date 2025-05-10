import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { Prisma } from "@prisma/client";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { createHash } from "crypto";
import { stageStatus } from "@/app/lib/sharedEnums";
import { MessageOrMessageHash } from "@/app/api/common/delegateStatement/delegateStatement";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
    try {
      return prismaWeb2Client.delegateStatements.upsert({
        where: {
          address_dao_slug_message_hash: {
            address: address.toLowerCase(),
            dao_slug: slug,
            message_hash: messageHash,
          },
          stage: stage,
        },
        update: data,
        create: data,
      });
    } catch (error) {
      console.error("Error updating draft:", error);
      throw new Error("Could not update draft delegate statement.");
    }
  }

  // Otherwise create a new published proposal
  try {
    return prismaWeb2Client.delegateStatements.create({ data });
  } catch (error) {
    console.error("Error creating published statement:", error);
    throw new Error("Could not create delegate statement.");
  }
}

/** This function is used to update an existing draft statement.
 * This function is likely to transition a multisig delegate statement from 'draft' to 'published'.
 * @param ${address} address - The address of the delegate
 * @param ${daoSlug} daoSlug - slug of DAO site
 * */
export const publishDelegateStatementDraft = ({
  address,
  messageOrMessageHash,
}: {
  address: string;
  messageOrMessageHash: MessageOrMessageHash;
}) => {
  let messageHash: string;
  if (messageOrMessageHash.type === "MESSAGE") {
    messageHash = createHash("sha256")
      .update(messageOrMessageHash.value)
      .digest("hex");
  } else {
    messageHash = messageOrMessageHash.value;
  }

  try {
    return prismaWeb2Client.delegateStatements
      .update({
        where: {
          address_dao_slug_message_hash: {
            address: address.toLowerCase(),
            dao_slug: slug,
            message_hash: messageHash,
          },
          stage: stageStatus.DRAFT, // Ensures we're only updating drafts
        },
        data: {
          stage: stageStatus.PUBLISHED, // Transition to published
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          switch (error.code) {
            case "P2025":
              throw new Error(
                `No draft found for the given address (${address.toLowerCase()}), DAO (${slug}), and message hash (${messageHash}).`
              );
            case "P1001":
              throw new Error("Cannot connect to database, please retry.");
            default:
              throw new Error(
                "Prisma failed to publish the delegate statement draft with the following error: " +
                  error.message
              );
          }
        }
      });
  } catch (error) {
    // unknown error handling
    console.error("Unknown Error updating draft to published:", error);
    throw new Error("Could not publish the delegate statement draft.");
  }
};

export const getDraftMessageHash = async (
  address: string
): Promise<string | null> => {
  try {
    const result = await prismaWeb2Client.delegateStatements.findFirst({
      where: {
        address: address.toLowerCase(),
        dao_slug: slug,
        stage: stageStatus.DRAFT,
      },
    });
    // No result found, return null
    return result ? result.message_hash : null;
  } catch (error) {
    throw new Error("Error retrieving draft message hash");
  }
};
