import "server-only";

import prisma from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { Prisma } from "@prisma/client";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";

export async function createDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
}) {
  const { twitter, warpcast, discord, email } = delegateStatement;
  const { slug } = Tenant.current();

  const valid = await verifyMessage({
    address,
    message,
    signature,
  });

  if (!valid) {
    throw new Error("Invalid signature");
  }

  const data = {
    address: address.toLowerCase(),
    dao_slug: slug,
    signature,
    payload: delegateStatement as Prisma.InputJsonValue,
    twitter,
    warpcast,
    discord,
    email,
  };

  return prisma.delegateStatements.upsert({
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
