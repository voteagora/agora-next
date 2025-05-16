"use client";

import { useState } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { OptimisticProposal } from "../../../proposals/draft/types";
import { useSimulateContract } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useRouter } from "next/navigation";
import { useWrappedWriteContract } from "@/hooks/useWrappedWriteContract";
import { onSubmitAction as deleteAction } from "../../draft/actions/deleteDraftProposal";

const OptimisticProposalAction = ({
  draftProposal,
}: {
  draftProposal: OptimisticProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);
  const [proposalCreated, setProposalCreated] = useState(false);
  const router = useRouter();
  const { selectedWalletAddress, isSelectedPrimaryAddress } =
    useSelectedWallet();
  const {
    data: config,
    isError: onPrepareError,
    error,
  } = useSimulateContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "proposeWithModule",
    args: inputData as any,
    query: {
      enabled: !proposalCreated,
    },
    account: selectedWalletAddress,
  });

  const { writeContractAsync: writeAsync, isPending: isWriteLoading } =
    useWrappedWriteContract();

  const submitProposal = async () => {
    try {
      const data = await writeAsync({
        ...config,
        onSubmitSafeTransaction: async () => {
          await deleteAction(draftProposal.id);
          router.push("/");
        },
      });

      if (isSelectedPrimaryAddress && data) {
        setProposalCreated(true);
        trackEvent({
          event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL,
          event_data: {
            transaction_hash: data,
            uses_plm: true,
            proposal_data: inputData,
          },
        });

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
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <UpdatedButton
        isLoading={isWriteLoading}
        fullWidth={true}
        type="primary"
        onClick={submitProposal}
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

export default OptimisticProposalAction;
