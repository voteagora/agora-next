import { useMemo } from "react";

import { ExclamationCircleIcon } from "@/icons/ExclamationCircleIcon";
import { DelegateToSelf } from "../Delegations/DelegateToSelf";
import { useProfileData } from "@/hooks/useProfileData";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { ZERO_ADDRESS } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

export const DelegateToSelfBanner = () => {
  const { ui } = Tenant.current();
  const copy = ui.copy;
  const { delegate, tokenBalance, delegatees } = useProfileData();
  const filteredDelegations = useMemo(() => {
    return delegatees?.filter((delegation) => delegation.to !== ZERO_ADDRESS);
  }, [delegatees]);
  const hasDelegated =
    Array.isArray(filteredDelegations) && filteredDelegations.length > 0;

  const shouldShowBanner =
    tokenBalance !== undefined &&
    tokenBalance !== BigInt(0) &&
    filteredDelegations !== undefined &&
    !hasDelegated;

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div className="w-full p-4 rounded-lg border border-negative inline-flex justify-start items-start gap-4 mt-3 mb-1">
      <ExclamationCircleIcon className="w-6 h-6 stroke-negative" />
      <div className="flex-1 flex-col justify-start items-start gap-1 text-primary">
        <div className="text-base font-bold leading-normal">
          {copy.delegates.delegation.selfBannerTitle}
        </div>
        <div className="text-sm font-medium leading-[21px]">
          {copy.delegates.delegation.selfBannerDescription}
        </div>
      </div>
      <DelegateToSelf
        delegate={delegate as DelegateChunk}
        className="font-medium px-[20px] py-3 h-full"
      />
    </div>
  );
};
