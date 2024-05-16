import DraftPreview from "../DraftPreview";
import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import { useContractRead, useAccount, useBlockNumber } from "wagmi";
import { ENSGovernorABI } from "@/lib/contracts/abis/ENSGovernor";
import Tenant from "@/lib/tenant/tenant";
import RequestSponsorshipForm from "../RequestSponsorshipForm";
import { useForm, FormProvider } from "react-hook-form";
import SponsorActions from "../../../sponsor/components/SponsorActions";

// TODO: either read from contract or add to tenant
const THRESHOLD = 100000000000000000000000;

const Actions = ({
  proposalDraft,
}: {
  proposalDraft: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const { address } = useAccount();
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
    <div className="mt-6">
      {hasEnoughVotes ? (
        <SponsorActions draftProposal={proposalDraft} />
      ) : (
        <RequestSponsorshipForm draftProposal={proposalDraft} />
      )}
    </div>
  );
};

const SubmitForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const methods = useForm({});
  return (
    <FormProvider {...methods}>
      <form>
        <p className="text-agora-stone-700 mb-6">
          Please proofread a preview of your proposal below. If you need to
          change any of its content, please edit your draft in the previous
          step.
        </p>
        <DraftPreview
          proposalDraft={draftProposal}
          actions={<Actions proposalDraft={draftProposal} />}
        />
      </form>
    </FormProvider>
  );
};

export default SubmitForm;
