"use client";

import { useState } from "react";
import FormItem from "./form/FormItem";
import { useFormContext } from "react-hook-form";
import TextInput from "./form/TextInput";
import {
  useEnsName,
  useEnsAvatar,
  useContractRead,
  useBlockNumber,
} from "wagmi";
import { ENSGovernorABI } from "@/lib/contracts/abis/ENSGovernor";
import Tenant from "@/lib/tenant/tenant";
import { UpdatedButton } from "@/components/Button";
import { onSubmitAction as requestSponsorshipAction } from "../actions/requestSponsorship";
import { ProposalDraft } from "@prisma/client";

export function truncateEthAddress(address: string | undefined) {
  if (!address) return "";
  var truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  var match = address.match(truncateRegex);
  if (!match) return address;
  return match[1] + "\u2026" + match[2];
}

const THRESHOLD = 100000000000000000000000;

const RequestSponsorshipForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { register, watch } = useFormContext();

  const address = watch("sponsorAddress");
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address,
  });

  const { data: ensAvatar, error } = useEnsAvatar({
    chainId: 1,
    name: ensName,
  });

  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useContractRead({
    abi: ENSGovernorABI,
    address: Tenant.current().contracts.governor.address as `0x${string}`,
    functionName: "getVotes",
    chainId: Tenant.current().contracts.governor.chain.id,
    args: [
      address as `0x${string}`,
      blockNumber ? blockNumber - BigInt(1) : BigInt(0),
    ],
  });

  const hasEnoughVotes = accountVotesData
    ? accountVotesData >= THRESHOLD
    : false;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormItem label="Sponsor address">
          <TextInput name="sponsorAddress" register={register} />
        </FormItem>
        <FormItem label="Sponsor verification">
          <span className="border border-agora-stone-100 p-2 rounded-lg w-full relative h-[42px]">
            <span className="flex flex-row space-x-2 items-center">
              {ensAvatar && (
                <img src={ensAvatar} className="w-6 h-6 rounded-full" />
              )}
              <p>{ensName ? ensName : truncateEthAddress(address)}</p>
            </span>
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
        className="mt-6"
        onClick={async () => {
          setIsPending(true);
          const res = await requestSponsorshipAction({
            draftProposalId: draftProposal.id,
            sponsor_address: address,
          });
          setIsPending(false);
          if (!res.ok) {
            // toast?
          } else {
            window.location.href = `/`;
          }
        }}
      >
        {isPending ? "Pending..." : "Request sponsorship"}
      </UpdatedButton>
    </>
  );
};

export default RequestSponsorshipForm;
