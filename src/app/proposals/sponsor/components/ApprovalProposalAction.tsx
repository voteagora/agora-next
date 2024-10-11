"use client";

import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useSimulateContract, useWriteContract } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { ApprovalProposal } from "@/app/proposals/draft/types";

const ApprovalProposalAction = ({
  draftProposal,
}: {
  draftProposal: ApprovalProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);

  const {
    data: config,
    isError: onPrepareError,
    error,
  } = useSimulateContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "proposeWithModule",
    args: inputData as any,
  });

  const { writeContractAsync: writeAsync, isPending: isWriteLoading } =
    useWriteContract();

  return (
    <>
      <UpdatedButton
        isLoading={isWriteLoading}
        fullWidth={true}
        type={onPrepareError ? "disabled" : "primary"}
        onClick={async () => {
          try {
            const data = await writeAsync?.(config!.request);
            if (!data) {
              // for dev
              console.log(error);
              return;
            }
            await sponsorDraftProposal({
              draftProposalId: draftProposal.id,
              onchain_transaction_hash: data,
            });

            openDialog({
              type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
              params: {
                redirectUrl: "/",
                txHash: data,
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

export default ApprovalProposalAction;
