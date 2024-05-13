import Tenant from "@/lib/tenant/tenant";
import prisma from "@/app/lib/prisma";
import { cache } from "react";
import { StakedDeposit } from "@/lib/types";

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
      //Note: Large amounts are stored in scientific notation 1.002e+21
      amount: Number(deposit.amount).toLocaleString().replace(/,/g, ""),
      delegatee: deposit.delegatee,
      depositor: deposit.depositor,
      id: Number(deposit.deposit_id),
    };
  });
}

export const apiFetchStakedDeposits = cache(fetchStakedDepositsForAddress);
