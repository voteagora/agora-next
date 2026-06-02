import { useProfileData } from "@/hooks/useProfileData";
import { useEffect, useMemo } from "react";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";
import { useAccount } from "wagmi";
import { ZERO_ADDRESS } from "@/lib/constants";

const EncourageDelegationDot = ({ className }: { className?: string }) => {
  const { tokenBalance, delegate, delegatees } = useProfileData();
  const { address } = useAccount();
  const filteredDelegations = useMemo(() => {
    return delegatees?.filter((delegation) => delegation.to !== ZERO_ADDRESS);
  }, [delegatees]);

  const hasDelegated =
    Array.isArray(filteredDelegations) && filteredDelegations.length > 0;
  const shouldShowDot =
    tokenBalance !== undefined &&
    tokenBalance !== BigInt(0) &&
    filteredDelegations !== undefined &&
    !hasDelegated;

  useEffect(() => {
    if (shouldShowDot && address) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.DELEGATION_ENCOURAGEMENT_DOT,
        event_data: {
          address: address as `0x${string}`,
        },
      });
    }
  }, [shouldShowDot, address]);

  if (!shouldShowDot) return null;

  return (
    <div
      className={`w-[10px] h-[10px] bg-negative rounded-full absolute border border-white ${className || ""}`}
    />
  );
};

export default EncourageDelegationDot;
