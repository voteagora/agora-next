import Tenant from "@/lib/tenant/tenant";

export async function getStakedBalance(address: string): Promise<bigint> {
  const { contracts } = Tenant.current();
  return contracts.staker!.contract.depositorTotalStaked(address);
}
