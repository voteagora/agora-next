import Tenant from "@/lib/tenant/tenant";
import prisma from "@/app/lib/prisma";
import { cache } from "react";
import { StakedDeposit } from "@/lib/types";
import { scientificNotationToPrecision } from "@/lib/utils";

export async function fetchStakedDepositsForAddress({
  address,
}: {
  address: string;
}): Promise<StakedDeposit[]> {
  const { namespace } = Tenant.current();
  const deposits = await prisma[`${namespace}StakedDeposits`].findMany({
    where: {
      depositor: address,
      amount: {
        gt: 0,
      },
    },
    orderBy: {
      deposit_id: "desc",
    },
    select: {
      deposit_id: true,
      depositor: true,
      amount: true,
      delegatee: true,
    },
  });

  return deposits.map((deposit) => {
    return {
      amount: scientificNotationToPrecision(
        deposit.amount.toString()
      ).toString(),
      delegatee: deposit.delegatee,
      depositor: deposit.depositor,
      id: Number(deposit.deposit_id),
    };
  });
}

export const apiFetchStakedDeposits = cache(fetchStakedDepositsForAddress);
