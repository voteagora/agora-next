import "server-only";

import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@/app/lib/sharedEnums";
import verifyMessage from "@/lib/serverVerifyMessage";
import { createHash } from "crypto";
import { doInSpan } from "@/app/lib/logging";
const { slug } = Tenant.current();

async function deleteDelegateStatement({
  address,
  messageHash,
  stage,
}: {
  address: `0x${string}`;
  messageHash: string;
  stage: stageStatus;
}) {
  return prismaWeb2Client.delegateStatements
    .delete({
      where: {
        address_dao_slug_stage: {
          address: address.toLowerCase(),
          dao_slug: slug,
          stage: stage,
        },
        message_hash: messageHash,
      },
    })
    .catch((error) => console.error(error));
}

/** This function is used to Delete an existing statement.
 * @param ${address} address - The address of the delegate
 * @param ${daoSlug} daoSlug - Slug of DAO site
 * @param ${message} message - Textual message statement
 * @param ${stage} stage - Stage of message, usually 'published'
 * */
export async function safeDeleteDelegateStatement({
  address,
  signature,
  message,
  stage,
}: {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
  stage: stageStatus;
}) {
  // Kick out if invalid
  const valid = await verifyMessage({
    address,
    message,
    signature,
  });
  if (!valid) {
    throw new Error("Invalid signature");
  }

  // create messageHash for db matches
  const messageHash = createHash("sha256").update(message).digest("hex");

  deleteDelegateStatement({ address, messageHash, stage });
}

export const safeDeleteDelegateStatementTracked = ({
  address,
  signature,
  message,
  stage,
}: {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
  stage: stageStatus;
}) => {
  return doInSpan(
    {
      name: "deleteDelegateStatement",
    },
    () =>
      safeDeleteDelegateStatement({
        address: address,
        signature: signature,
        message: message,
        stage: stage,
      })
  );
};
