import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { StakedDeposit } from "@/lib/types";
import { findStakedDeposit } from "@/lib/prismaUtils";

interface IFetchDepositProps {
  id: number;
}

export async function fetchDeposit({
  id,
}: IFetchDepositProps): Promise<StakedDeposit> {
  const { namespace, token } = Tenant.current();

  const deposit = await findStakedDeposit({
    namespace,
    depositId: id,
  });

  if (!deposit) {
    throw new Error(`Deposit with id ${id} not found`);
  }

  return {
    amount: Number(deposit.amount).toLocaleString().replace(/,/g, ""),
    delegatee: deposit.delegatee,
    depositor: deposit.depositor,
    id: Number(deposit.deposit_id),
  };
}

export const apiFetchDeposit = cache(fetchDeposit);
