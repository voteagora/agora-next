"use client";

import { memo, useEffect, useState } from "react";
import { useSimulateContract, useWriteContract } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { BasicProposal } from "../../../proposals/draft/types";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { parseError } from "../../draft/utils/stages";

const BasicProposalAction = memo(
  ({ draftProposal }: { draftProposal: BasicProposal }) => {
    const openDialog = useOpenDialog();
    const { contracts } = Tenant.current();
    const { inputData } = getInputData(draftProposal);
    const [proposalCreated, setProposalCreated] = useState(false);

    const {
      data: config,
      isError: onPrepareError,
      isPending: isSimulating,
      error,
    } = useSimulateContract({
      address: contracts.governor.address as `0x${string}`,
      chainId: contracts.governor.chain.id,
      abi: contracts.governor.abi,
      functionName: "propose",
      args: inputData as any,
      query: {
        enabled: !proposalCreated,
      },
    });

    useEffect(() => {
      console.log("mounted");
    }, []);

    console.log(proposalCreated);
    const { writeContractAsync: writeAsync, isPending: isWriteLoading } =
      useWriteContract();

    return (
      <>
        <UpdatedButton
          isLoading={isWriteLoading || isSimulating}
          fullWidth={true}
          type={onPrepareError && !proposalCreated ? "disabled" : "primary"}
          onClick={async () => {
            try {
              const data = await writeAsync(config!.request);
              if (!data) {
                // for dev
                console.log(error);
                return;
              }

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
            } catch (error) {
              console.log(error);
            }
          }}
        >
          Sponsor
        </UpdatedButton>

        {onPrepareError && !proposalCreated && (
          <div className="p-4 border border-negative bg-negative/10 rounded mt-4 text-sm text-negative break-words hyphens-auto">
            {parseError(error)}
          </div>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the ID changes
    return prevProps.draftProposal.id === nextProps.draftProposal.id;
  }
);
BasicProposalAction.displayName = "BasicProposalAction";
export default BasicProposalAction;
