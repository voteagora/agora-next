import "server-only";

import prisma from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { Prisma } from "@prisma/client";
import verifyMessage from "@/lib/serverVerifyMessage";
import { deploymentToDaoSlug } from "@/lib/config";

export async function createDelegateStatementForNamespace({
  address,
  delegateStatement,
  signature,
  message,
  namespace,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
  namespace: "optimism";
}) {
  const { twitter, discord, email } = delegateStatement;
  const daoSlug = deploymentToDaoSlug(namespace);

  const valid = await verifyMessage({
    address,
    message,
    signature,
    daoSlug: daoSlug,
  });

  if (!valid) {
    throw new Error("Invalid signature");
  }

  const data = {
    address: address.toLowerCase(),
    dao_slug: daoSlug,
    signature,
    payload: delegateStatement as Prisma.InputJsonValue,
    twitter,
    discord,
    email,
  };

  return prisma.delegateStatements.upsert({
    where: {
      address_dao_slug: {
        address: address.toLowerCase(),
        dao_slug: daoSlug,
      },
    },
    update: data,
    create: data,
  });
}
