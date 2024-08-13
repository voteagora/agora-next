"use client";

import { isAddress } from "viem";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import AddressInput from "./form/AddressInput";
import { useBlockNumber } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { onSubmitAction as requestSponsorshipAction } from "../actions/requestSponsorship";
import AvatarAddress from "./AvatarAdress";
import { invalidatePath } from "../actions/revalidatePath";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { DraftProposal, ProposalGatingType } from "../types";
import Tenant from "@/lib/tenant/tenant";

const RequestSponsorshipForm = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = plmToggle?.config?.gatingType;
  const [isPending, setIsPending] = useState(false);
  const { watch, control } = useFormContext();

  const address = watch("sponsorAddress");

  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber || BigInt(0),
  });

  const canSponsor = () => {
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

  const canAddressSponsor = canSponsor();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <AddressInput
          control={control}
          label="Sponsor address"
          name="sponsorAddress"
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
      </div>
      <UpdatedButton
        fullWidth={true}
        isSubmit={false}
        isLoading={isPending}
        type={canAddressSponsor ? "primary" : "disabled"}
        className="mt-6"
        onClick={async () => {
          if (canAddressSponsor) {
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
        Request sponsorship
      </UpdatedButton>
    </>
  );
};

export default RequestSponsorshipForm;
