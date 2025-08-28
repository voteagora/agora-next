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
import {
  DraftProposal,
  PLMConfig,
  ProposalGatingType,
  ProposalScope,
  ProposalType,
} from "../types";
import Tenant from "@/lib/tenant/tenant";
import { useAccount, useSignMessage } from "wagmi";

const RequestSponsorshipForm = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = (plmToggle?.config as PLMConfig)?.gatingType;
  const [isPending, setIsPending] = useState(false);
  const { watch, control } = useFormContext();
  const { address: creatorAddress } = useAccount();
  const messageSigner = useSignMessage();

  const address = watch("sponsorAddress");
  const votingModuleType = draftProposal.voting_module_type;

  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();
  const { data: blockNumber } = useBlockNumber({
    chainId: tenant.ui.toggle("use-l1-block-number")?.enabled
      ? tenant.contracts.chainForTime?.id
      : undefined,
  });
  const { data: accountVotesData } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber || BigInt(0),
    enabled: true,
  });

  const canSponsor = () => {
    if (votingModuleType === ProposalType.SOCIAL) {
      const requiredTokensForSnapshot = (plmToggle?.config as PLMConfig)
        ?.snapshotConfig?.requiredTokens;
      return (
        accountVotesData !== undefined &&
        requiredTokensForSnapshot !== undefined &&
        accountVotesData >= requiredTokensForSnapshot
      );
    }
    if (
      draftProposal.proposal_scope === ProposalScope.OFFCHAIN_ONLY ||
      (draftProposal.proposal_scope === ProposalScope.HYBRID &&
        !!draftProposal.onchain_transaction_hash)
    ) {
      const config = plmToggle?.config as PLMConfig;
      return (
        !!config.offchainProposalCreator &&
        config.offchainProposalCreator.includes(address || "")
      );
    }
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
            const messagePayload = {
              action: "requestSponsorship",
              draftProposalId: draftProposal.id,
              creatorAddress,
              timestamp: new Date().toISOString(),
            };
            const message = JSON.stringify(messagePayload);
            const signature = await messageSigner
              .signMessageAsync({ message })
              .catch(() => undefined);
            if (!signature) {
              setIsPending(false);
              return;
            }
            const res = await requestSponsorshipAction({
              draftProposalId: draftProposal.id,
              sponsor_address: address,
              creatorAddress: creatorAddress as `0x${string}`,
              message,
              signature,
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
