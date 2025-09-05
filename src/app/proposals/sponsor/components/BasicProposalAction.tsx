"use client";

import { useState } from "react";
import {
  useSimulateContract,
  useWriteContract,
  useAccount,
  useSignMessage,
} from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { BasicProposal, ProposalScope } from "../../../proposals/draft/types";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { parseError } from "../../draft/utils/stages";

const BasicProposalAction = ({
  draftProposal,
}: {
  draftProposal: BasicProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);
  const [proposalCreated, setProposalCreated] = useState(false);
  const proposal_scope = draftProposal.proposal_scope;
  const { address } = useAccount();
  const messageSigner = useSignMessage();

  /**
   * Notes on proposal methods per governor:
   * ENS (OZ gov): propose(address[] targets, uint256[] values, string[] calldatas, string description)
   * OP (Agora gov): proposeWithModule()
   * Cyber: tbd
   * NewDAO: tbd
   * Linea: tbd
   * Uni: propose(address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, string description)
   */

  // TODO: input data contains proposal type, but I don't think OZ based proposals have proposal type
  // So we need to check which type of governor we are dealing with, based on the tenant, and act accordingly.

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

            const messagePayload = {
              action: "sponsorDraft",
              draftProposalId: draftProposal.id,
              creatorAddress: address,
              timestamp: new Date().toISOString(),
            };
            const message = JSON.stringify(messagePayload);
            const signature = await messageSigner
              .signMessageAsync({ message })
              .catch(() => undefined);
            if (!signature) return;
            await sponsorDraftProposal({
              draftProposalId: draftProposal.id,
              onchain_transaction_hash: data,
              is_offchain_submission: false,
              proposal_scope: draftProposal.proposal_scope,
              creatorAddress: address as `0x${string}`,
              message,
              signature,
            });
            openDialog({
              type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
              params: {
                redirectUrl: "/",
                txHash: data,
                isHybrid: proposal_scope === ProposalScope.HYBRID,
                draftProposal,
              },
            });
          } catch (error) {
            console.log(error);
          }
        }}
      >
        Submit proposal
      </UpdatedButton>

      {onPrepareError && !proposalCreated && (
        <div className="p-4 border border-negative bg-negative/10 rounded mt-4 text-sm text-negative break-words hyphens-auto">
          {parseError(error)}
        </div>
      )}
    </>
  );
};

export default BasicProposalAction;
