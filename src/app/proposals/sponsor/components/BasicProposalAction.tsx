import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { BasicProposal } from "../../../proposals/draft/types";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";

const BasicProposalAction = ({
  draftProposal,
}: {
  draftProposal: BasicProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);

  const { config } = usePrepareContractWrite({
    address: contracts.governor.address as `0x${string}`,
    chainId: contracts.governor.chain.id,
    abi: contracts.governor.abi,
    functionName: "propose",
    args: inputData,
  });

  const { writeAsync, isLoading: isWriteLoading } = useContractWrite(config);

  return (
    <UpdatedButton
      isLoading={isWriteLoading}
      fullWidth={true}
      type="primary"
      onClick={async () => {
        try {
          const data = await writeAsync?.();
          await sponsorDraftProposal({
            draftProposalId: draftProposal.id,
            onchain_transaction_hash: data?.hash,
          });

          openDialog({
            type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
            params: {
              redirectUrl: "/",
              txHash: data?.hash as `0x${string}`,
            },
          });
        } catch (error) {}
      }}
    >
      Submit proposal
    </UpdatedButton>
  );
};

export default BasicProposalAction;
