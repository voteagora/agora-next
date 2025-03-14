"use client";

import DraftPreview from "../DraftPreview";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import RequestSponsorshipForm from "../RequestSponsorshipForm";
import { useForm, FormProvider } from "react-hook-form";
import SponsorActions from "../../../sponsor/components/SponsorActions";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { useManager } from "@/hooks/useManager";
import { DraftProposal, PLMConfig, ProposalGatingType } from "../../types";
import Tenant from "@/lib/tenant/tenant";
import { useGetVotes } from "@/hooks/useGetVotes";
import { UpdateVotableSupplyOracle } from "@/app/proposals/components/UpdateVotableSupplyOracle";

const Actions = ({ proposalDraft }: { proposalDraft: DraftProposal }) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = (plmToggle?.config as PLMConfig)?.gatingType;

  const { address } = useAccount();

  const { data: blockNumber } = useBlockNumber({
    chainId: tenant.ui.toggle("use-l1-block-number")?.enabled
      ? tenant.contracts.chainForTime?.id
      : undefined,
  });

  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();
  const { data: accountVotes } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber ? blockNumber - BigInt(1) : BigInt(0),
    enabled: !!address,
  });

  const canSponsor = () => {
    switch (gatingType) {
      case ProposalGatingType.MANAGER:
        return manager === address;
      case ProposalGatingType.TOKEN_THRESHOLD:
        return accountVotes !== undefined && threshold !== undefined
          ? accountVotes >= threshold
          : false;
      case ProposalGatingType.GOVERNOR_V1:
        return (
          manager === address ||
          (accountVotes !== undefined && threshold !== undefined
            ? accountVotes >= threshold
            : false)
        );
      default:
        return false;
    }
  };

  const canAddressSponsor = canSponsor();

  return (
    <div className="mt-6">
      {tenant.contracts.votableSupplyOracle?.address && (
        <UpdateVotableSupplyOracle
          votableSupplyOracle={tenant.contracts.votableSupplyOracle}
          tokenDecimal={tenant.token.decimals}
        />
      )}
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
