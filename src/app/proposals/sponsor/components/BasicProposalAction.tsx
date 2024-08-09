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

  /**
   * Notes on proposal methods per governor:
   * ENS (OZ gov): propose(address[] targets, uint256[] values, string[] calldatas, string description)
   * OP (Agora gov): proposeWithModule()
   * Cyber: tbd
   * Scroll: tbd
   * Linea: tbd
   * Uni: tbd
   */

  // TODO: input data contains proposal type, but I don't think OZ based proposals have proposal type
  // So we need to check which type of governor we are dealing with, based on the tenant, and act accordingly.
  const {
    config,
    isError: onPrepareError,
    error,
  } = usePrepareContractWrite({
    address: contracts.governor.address as `0x${string}`,
    chainId: contracts.governor.chain.id,
    abi: contracts.governor.abi,
    functionName: "propose",
    args: inputData as any,
  });

  const { writeAsync, isLoading: isWriteLoading } = useContractWrite(config);

  return (
    <>
      <UpdatedButton
        isLoading={isWriteLoading}
        fullWidth={true}
        type={onPrepareError ? "disabled" : "primary"}
        onClick={async () => {
          try {
            const data = await writeAsync?.();
            if (!data) {
              // for dev
              console.log(error);
              return;
            }

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

      {onPrepareError && (
        <div className="p-4 border border-line bg-wash rounded mt-4 text-sm text-tertiary break-words hyphens-auto">
          {error?.message}
        </div>
      )}
    </>
  );
};

export default BasicProposalAction;
