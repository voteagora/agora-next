import { useProfileData } from "@/hooks/useProfileData";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { useAccount } from "wagmi";

const EncourageDelegationDot = ({ className }: { className?: string }) => {
  const { tokenBalance, delegate, delegatees } = useProfileData();
  const { address } = useAccount();
  const hasDelegated = !delegatees?.length;
  const canEncourageDelegationBecauseOfVP =
    tokenBalance !== BigInt(0) && delegate?.votingPower?.total === "0";

  const canEncourageDelegationBecauseOfNoDelegation =
    tokenBalance !== BigInt(0) && !hasDelegated;

  const shouldShowDot =
    canEncourageDelegationBecauseOfVP ||
    canEncourageDelegationBecauseOfNoDelegation;

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
      className={`w-[10px] h-[10px] bg-negative rounded-full absolute ${className || ""}`}
    />
  );
};

export default EncourageDelegationDot;
