"use client";

import { isAddress } from "viem";
import { useState } from "react";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
} from "react-hook-form";
import AddressInput from "./form/AddressInput";
import { UpdatedButton } from "@/components/Button";
import { onSubmitAction as requestSponsorshipAction } from "../actions/requestSponsorship";
import AvatarAddress from "./AvatarAdress";
import { invalidatePath } from "../actions/revalidatePath";
import { DraftProposal } from "../types";
import SwitchInput from "./form/SwitchInput";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ProposalStage } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCanSponsor } from "../hooks/useCanSponsor";
import { useAccount } from "wagmi";

enum Visibility {
  PUBLIC = "Public",
  PRIVATE = "Private",
}

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
              ) : isSuccess ? (
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

const RequestSponsorshipForm = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const { address } = useAccount();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { watch, control, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sponsors",
  });

  const formValid = true;
  const visibility = watch("visibility");
  const sponsors = watch("sponsors");

  const { data: canUserSponsor } = useCanSponsor(address);

  return (
    <>
      <SwitchInput
        control={control}
        label="Draft proposal visibility"
        required={true}
        options={Object.values(Visibility)}
        name="visibility"
      />
      {visibility === Visibility.PRIVATE && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {fields.map((_field, index) => (
            <SponsorInput
              key={`sponsor-${index}`}
              index={index}
              remove={remove}
            />
          ))}
          <button
            type="button"
            onClick={() => append({ address: "" })}
            className="bg-neutral text-primary col-span-2 border border-line rounded-lg p-2 font-semibold"
          >
            Add sponsor
          </button>
        </div>
      )}
      <UpdatedButton
        fullWidth={true}
        isSubmit={false}
        isLoading={isPending}
        type={formValid ? "primary" : "disabled"}
        className="mt-6"
        onClick={async () => {
          if (formValid) {
            setIsPending(true);
            const res = await requestSponsorshipAction({
              draftProposalId: draftProposal.id,
              is_public: visibility === Visibility.PUBLIC,
              sponsors: sponsors.filter((sponsor: { address: `0x${string}` }) =>
                isAddress(sponsor.address)
              ),
            });
            if (res.ok) {
              invalidatePath(draftProposal.id);
              router.push(`/proposals/sponsor/${draftProposal.id}`);
            } else {
              console.error(res.message);
            }
            setIsPending(false);
          }
        }}
      >
        {draftProposal.stage === ProposalStage.AWAITING_SPONSORSHIP
          ? "Update draft"
          : "Create draft"}
      </UpdatedButton>
      {canUserSponsor && (
        <>
          <div className="flex flex-row items-center justify-center mt-4 gap-2">
            <span className="h-[1px] w-full border-b border-line block"></span>
            <span className="text-xs">OR</span>
            <span className="h-[1px] w-full border-b border-line block"></span>
          </div>
          <UpdatedButton
            fullWidth={true}
            isSubmit={false}
            isLoading={isPending}
            type={formValid ? "primary" : "disabled"}
            className="mt-4"
            onClick={async () => {
              if (formValid) {
                setIsPending(true);
                const res = await requestSponsorshipAction({
                  draftProposalId: draftProposal.id,
                  is_public: visibility === Visibility.PUBLIC,
                  sponsors: sponsors.filter(
                    (sponsor: { address: `0x${string}` }) =>
                      isAddress(sponsor.address)
                  ),
                });
                if (res.ok) {
                  invalidatePath(draftProposal.id);
                  router.push(`/proposals/sponsor/${draftProposal.id}`);
                } else {
                  console.error(res.message);
                }
                setIsPending(false);
              }
            }}
          >
            Publish onchain
          </UpdatedButton>
          <p className="text-xs text-secondary mt-2">
            You meet the criteria for publishing a proposal onchain. If you
            would like, you can publish it now. Or, create a draft to create a
            sharable offchain proposal for early feedback.
          </p>
        </>
      )}
    </>
  );
};

export default RequestSponsorshipForm;
