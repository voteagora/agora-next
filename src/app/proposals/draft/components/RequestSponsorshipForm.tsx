"use client";

import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { useState } from "react";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
} from "react-hook-form";
import AddressInput from "./form/AddressInput";
import { useBlockNumber } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { onSubmitAction as requestSponsorshipAction } from "../actions/requestSponsorship";
import AvatarAddress from "./AvatarAdress";
import { invalidatePath } from "../actions/revalidatePath";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import {
  DraftProposal,
  PLMConfig,
  ProposalGatingType,
  ProposalType,
} from "../types";
import Tenant from "@/lib/tenant/tenant";
import SwitchInput from "./form/SwitchInput";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ProposalStage } from "@prisma/client";
import { useRouter } from "next/navigation";

enum Visibility {
  PUBLIC = "Public",
  PRIVATE = "Private",
}

const canSponsor = (
  gatingType: ProposalGatingType | undefined,
  manager: `0x${string}` | undefined,
  address: `0x${string}` | undefined,
  accountVotesData: bigint | undefined,
  threshold: bigint | undefined
) => {
  switch (gatingType) {
    case ProposalGatingType.MANAGER:
      return manager === address;
    case ProposalGatingType.TOKEN_THRESHOLD:
      return accountVotesData !== undefined && threshold !== undefined
        ? accountVotesData >= threshold
        : false;
    case ProposalGatingType.GOVERNOR_V1:
      return (
        manager === address ||
        (accountVotesData !== undefined && threshold !== undefined
          ? accountVotesData >= threshold
          : false)
      );
    default:
      return false;
  }
};

const SponsorInput = ({
  index,
  remove,
}: {
  index: number;
  remove: UseFieldArrayRemove;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = plmToggle?.config?.gatingType;
  const { control, watch } = useFormContext();
  const address = watch(`sponsors.${index}.address`);

  const { data: threshold, isFetched: isThresholdFetched } =
    useProposalThreshold();
  const { data: manager, isFetched: isManagerFetched } = useManager();
  const { data: blockNumber, isFetched: isBlockNumberFetched } =
    useBlockNumber();
  const { data: accountVotesData, isFetched: isAccountVotesFetched } =
    useGetVotes({
      address: address as `0x${string}`,
      blockNumber: blockNumber || BigInt(0),
    });

  const {
    data: canAddressSponsor,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: [
      "can-sponsor",
      address,
      gatingType,
      manager,
      accountVotesData,
      threshold,
    ],
    queryFn: () => {
      return canSponsor(
        gatingType,
        manager as `0x${string}`,
        address as `0x${string}`,
        accountVotesData,
        threshold
      );
    },
    enabled:
      isThresholdFetched &&
      isManagerFetched &&
      isBlockNumberFetched &&
      isAccountVotesFetched,
  });

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
    </>
  );
};

export default RequestSponsorshipForm;
