"use client";

import { isAddress } from "viem";
import { useMemo, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
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

const SponsorInput = ({ index }: { index: number }) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = plmToggle?.config?.gatingType;
  const { control, watch } = useFormContext();
  const address = watch(`sponsors.${index}.address`);

  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber || BigInt(0),
  });

  const canAddressSponsor = useMemo(
    () =>
      canSponsor(
        gatingType,
        manager as `0x${string}`,
        address as `0x${string}`,
        accountVotesData,
        threshold
      ),
    [gatingType, manager, address, accountVotesData, threshold]
  );

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
        <div className="border border-line p-2 rounded-lg w-full relative h-[42px]">
          {isAddress(address) && <AvatarAddress address={address} />}
          <div
            className={`absolute right-2 top-2.5 text-sm ${canAddressSponsor ? "text-positive" : "text-negative"}`}
          >
            {canAddressSponsor ? "Can sponsor" : "Cannot sponsor"}
          </div>
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
  const [isPending, setIsPending] = useState(false);
  const { watch, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sponsors",
  });

  const address = watch("sponsorAddress");
  const visibility = watch("visibility");
  const formValid = true;

  return (
    <>
      <SwitchInput
        control={control}
        label="Draft proposal visibility"
        required={true}
        options={["Public", "Private"]}
        name="visibility"
      />
      {visibility === "Private" && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {fields.map((_field, index) => (
            <SponsorInput key={`sponsor-${index}`} index={index} />
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
              sponsor_address: address,
            });
            setIsPending(false);
            if (res.ok) {
              invalidatePath(draftProposal.id);
            }
          }
        }}
      >
        Create draft
      </UpdatedButton>
    </>
  );
};

export default RequestSponsorshipForm;
