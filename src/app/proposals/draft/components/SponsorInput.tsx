"use client";

import { isAddress } from "viem";
import { useFormContext, UseFieldArrayRemove } from "react-hook-form";
import AddressInput from "./form/AddressInput";
import AvatarAddress from "./AvatarAdress";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useCanSponsor } from "../hooks/useCanSponsor";
import { XMarkIcon } from "@heroicons/react/20/solid";

const SponsorInput = ({
  index,
  remove,
}: {
  index: number;
  remove: UseFieldArrayRemove;
}) => {
  const { control, watch } = useFormContext();
  const address = watch(`sponsors.${index}.address`);

  const {
    data: canAddressSponsor,
    isError,
    isFetching,
    isSuccess,
  } = useCanSponsor(address);

  return (
    <>
      <AddressInput
        control={control}
        label="Sponsor address"
        name={`sponsors.${index}.address`}
      />
      <div className="space-y-1">
        <label className="text-xs font-semibold text-secondary block">
          Sponsor verification
        </label>
        <div className="flex items-center justify-between gap-2">
          <div className="border border-line p-2 rounded-lg w-full relative h-[42px]">
            {isAddress(address) && <AvatarAddress address={address} />}
            <div className="absolute right-2 top-2.5 text-sm">
              {isFetching ? (
                <LoadingSpinner className="w-5 h-5 text-tertiary" />
              ) : isError ? (
                <span className="text-negative">Error checking status</span>
              ) : isAddress(address) && isSuccess ? (
                <span
                  className={
                    canAddressSponsor ? "text-positive" : "text-negative"
                  }
                >
                  {canAddressSponsor ? "Can sponsor" : "Cannot sponsor"}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            className="border border-line rounded-lg h-[42px] w-[42px] flex items-center justify-center hover:bg-tertiary/5 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default SponsorInput;
