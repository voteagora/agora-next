import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { StakedDeposit } from "@/lib/types";
import { scientificNotationToPrecision } from "@/lib/utils";
import { findStakedDeposits } from "@/lib/prismaUtils";

export async function fetchStakedDepositsForAddress({
  address,
}: {
  address: string;
}): Promise<StakedDeposit[]> {
  const { namespace } = Tenant.current();
  const deposits = await findStakedDeposits({
    namespace,
    address,
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
