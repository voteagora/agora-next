import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import Tenant from "@/lib/tenant/tenant";
import { createSnapshot } from "../../draft/utils/createSnapshot";
import { ProposalType } from "../../../proposals/draft/types";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ENSGovernorABI } from "@/lib/contracts/abis/ENSGovernor";
import { useAccount } from "wagmi";
import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

const SponsorActions = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const openDialog = useOpenDialog();
  const { address } = useAccount();
  const { inputData } = getInputData(draftProposal);
  const {
    config,
    isError: onPrepareError,
    error,
  } = usePrepareContractWrite({
    address: "0xb65c031ac61128ae791d42ae43780f012e2f7f89",
    abi: ENSGovernorABI,
    functionName: "propose",
    args: inputData,
    chainId: 11155111,
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div>
      <UpdatedButton
        isLoading={isLoading}
        fullWidth={true}
        type="primary"
        onClick={async () => {
          if (draftProposal.proposal_type === ProposalType.SOCIAL) {
            const proposalId = await createSnapshot({
              address: address as `0x${string}`,
              proposal: draftProposal,
            });

            const snapshotLink = Tenant.current().isProd
              ? `https://snapshot.org/#/ens.eth/proposal/${proposalId}`
              : `https://testnet.snapshot.org/#/michaelagora.eth/proposal/${proposalId}`;

            openDialog({
              type: "SPONSOR_DRAFT_PROPOSAL",
              params: { redirectUrl: "" },
            });
          } else {
            await writeAsync?.();
            // TODO: update proposal status
            // TODO: add tx hash
            openDialog({
              type: "SPONSOR_DRAFT_PROPOSAL",
              params: { redirectUrl: "" },
            });
          }
        }}
      >
        Submit proposal
      </UpdatedButton>
    </div>
  );
};

export default SponsorActions;
