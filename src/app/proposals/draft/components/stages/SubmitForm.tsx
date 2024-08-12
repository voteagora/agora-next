"use client";

import DraftPreview from "../DraftPreview";
import { useAccount, useBlockNumber } from "wagmi";
import RequestSponsorshipForm from "../RequestSponsorshipForm";
import { useForm, FormProvider } from "react-hook-form";
import SponsorActions from "../../../sponsor/components/SponsorActions";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { DraftProposal, ProposalGatingType } from "../../types";
import Tenant from "@/lib/tenant/tenant";

const Actions = ({ proposalDraft }: { proposalDraft: DraftProposal }) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = plmToggle?.config?.gatingType;

  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber || BigInt(0),
  });
  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();

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
    <div className="mt-6">
      {canAddressSponsor ? (
        <SponsorActions draftProposal={proposalDraft} />
      ) : (
        <RequestSponsorshipForm draftProposal={proposalDraft} />
      )}
    </div>
  );
};

const SubmitForm = ({ draftProposal }: { draftProposal: DraftProposal }) => {
  const methods = useForm({});
  return (
    <FormProvider {...methods}>
      <form>
        <DraftPreview
          proposalDraft={draftProposal}
          actions={<Actions proposalDraft={draftProposal} />}
        />
      </form>
    </FormProvider>
  );
};

export default SubmitForm;
