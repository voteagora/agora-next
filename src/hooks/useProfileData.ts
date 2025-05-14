import Tenant from "@/lib/tenant/tenant";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useDelegate } from "@/hooks/useDelegate";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useGetDelegatees } from "./useGetDelegatee";

export const useProfileData = (address?: `0x${string}`) => {
  const { ui } = Tenant.current();
  const isSmartAccountEnabled = ui?.smartAccountConfig?.factoryAddress;

  const { data: delegate, isFetching } = useDelegate({
    address,
  });

  const { data: delegatees } = useGetDelegatees({ address });

  const { data: scwAddress } = useSmartAccountAddress({
    owner: delegate ? (isSmartAccountEnabled ? address : undefined) : undefined,
  });

  const { data: tokenBalance } = useTokenBalance(
    delegate ? (isSmartAccountEnabled ? scwAddress : address) : undefined
  );
  const hasStatement = !!delegate?.statement;

  const canCreateDelegateStatement =
    ui?.toggle("delegates/edit")?.enabled === true;

  return {
    address,
    isFetching,
    tokenBalance,
    delegate,
    scwAddress,
    hasStatement,
    canCreateDelegateStatement,
    delegatees,
  };
};
