import { ExclamationCircleIcon } from "@/icons/ExclamationCircleIcon";
import { DelegateToSelf } from "../Delegations/DelegateToSelf";
import { useProfileData } from "@/hooks/useProfileData";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";

export const DelegateToSelfBanner = () => {
  const { delegate, tokenBalance, delegatees } = useProfileData();
  const hasDelegated = !!delegatees?.length;
  if (hasDelegated || !tokenBalance || tokenBalance === BigInt(0)) {
    return null;
  }

  return (
    <div className="w-full p-4 rounded-lg bg-wash border border-line inline-flex justify-start items-start gap-4 mt-2 mb-3">
      <ExclamationCircleIcon className="w-6 h-6 stroke-negative" />
      <div className="flex-1 flex-col justify-start items-start gap-1 text-neutral-900">
        <div className="text-base font-bold leading-normal">
          Your tokens can't be voted with!
        </div>
        <div className="text-sm font-medium leading-[21px]">
          Make your vote count, delegate to yourself or someone else in the
          community.
        </div>
      </div>
      <DelegateToSelf
        delegate={delegate as DelegateChunk}
        className="font-medium px-[20px] py-3"
      />
    </div>
  );
};
