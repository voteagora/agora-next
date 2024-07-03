"use client";

import { isAddress } from "viem";
import { useState } from "react";
import FormItem from "./form/FormItem";
import { useFormContext } from "react-hook-form";
import AddressInput from "./form/AddressInput";
import { useContractRead, useBlockNumber } from "wagmi";
import { ENSGovernorABI } from "@/lib/contracts/abis/ENSGovernor";
import Tenant from "@/lib/tenant/tenant";
import { UpdatedButton } from "@/components/Button";
import { onSubmitAction as requestSponsorshipAction } from "../actions/requestSponsorship";
import { ProposalDraft } from "@prisma/client";
import AvatarAddress from "./AvatarAdress";
import { invalidatePath } from "../actions/revalidatePath";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";

const RequestSponsorshipForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft;
}) => {
  const tenant = Tenant.current();
  const { data: threshold } = useProposalThreshold();
  const [isPending, setIsPending] = useState(false);
  const { watch } = useFormContext();

  const address = watch("sponsorAddress");

  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useContractRead({
    abi: ENSGovernorABI,
    address: tenant.contracts.governor.address as `0x${string}`,
    functionName: "getVotes",
    chainId: tenant.contracts.governor.chain.id,
    args: [
      address as `0x${string}`,
      blockNumber ? blockNumber - BigInt(1) : BigInt(0),
    ],
  });

  const hasEnoughVotes = accountVotesData
    ? accountVotesData >= threshold!
    : false;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormItem label="Sponsor address">
          <AddressInput name="sponsorAddress" />
        </FormItem>
        <FormItem label="Sponsor verification">
          <span className="border border-agora-stone-100 p-2 rounded-lg w-full relative h-[42px]">
            {isAddress(address) && <AvatarAddress address={address} />}
            <span
              className={`absolute right-2 top-2 ${hasEnoughVotes ? "text-green-500" : "text-red-500"}`}
            >
              {hasEnoughVotes ? "Can sponsor" : "Cannot sponsor"}
            </span>
          </span>
        </FormItem>
      </div>
      <UpdatedButton
        fullWidth={true}
        isSubmit={false}
        isLoading={isPending}
        className="mt-6"
        onClick={async () => {
          setIsPending(true);
          const res = await requestSponsorshipAction({
            draftProposalId: draftProposal.id,
            sponsor_address: address,
          });
          setIsPending(false);
          if (res.ok) {
            invalidatePath(draftProposal.id);
          }
        }}
      >
        Request sponsorship
      </UpdatedButton>
    </>
  );
};

export default RequestSponsorshipForm;
