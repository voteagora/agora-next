import DraftPreview from "../DraftPreview";
import { useAccount, useBlockNumber } from "wagmi";
import RequestSponsorshipForm from "../RequestSponsorshipForm";
import { useForm, FormProvider } from "react-hook-form";
import SponsorActions from "../../../sponsor/components/SponsorActions";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { useGetVotes } from "@/hooks/useGetVotes";
import { DraftProposal } from "../../types";

const Actions = ({ proposalDraft }: { proposalDraft: DraftProposal }) => {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber || BigInt(0),
  });
  const { data: threshold } = useProposalThreshold();

  const hasEnoughVotes =
    accountVotesData && threshold ? accountVotesData >= threshold : false;

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

const SubmitForm = ({ draftProposal }: { draftProposal: DraftProposal }) => {
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
