import { useAccount } from "wagmi";
import { useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useDelegate } from "@/hooks/useDelegate";
import { useTokenBalance } from "@/hooks/useTokenBalance";

export const useProfileData = () => {
  const { ui } = Tenant.current();
  const { address } = useAccount();
  const [shouldHydrate, setShouldHydrate] = useState(false);
  const isSmartAccountEnabled = ui?.smartAccountConfig?.factoryAddress;

  const { data: delegate, isFetching } = useDelegate({
    address: shouldHydrate ? address : undefined,
  });

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
    setShouldHydrate,
  };
};
