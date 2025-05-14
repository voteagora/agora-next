"use client";

import { useState } from "react";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import { useSafeProtocolKit } from "@/contexts/SafeProtocolKit";
import { useSafeApiKit } from "@/contexts/SafeApiKitContext";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { getAddress, encodeFunctionData } from "viem";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { BasicProposal } from "../../../proposals/draft/types";
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
  const { address } = useAccount();
  const { protocolKit } = useSafeProtocolKit();
  const { safeApiKit } = useSafeApiKit();
  const { isSelectedPrimaryAddress, selectedWalletAddress } =
    useSelectedWallet();
  const [safeTxHash, setSafeTxHash] = useState<`0x${string}` | undefined>();

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
        onClick={async () => {
          try {
            let txHash;

            if (!isSelectedPrimaryAddress && protocolKit && safeApiKit) {
              try {
                // Use viem's encodeFunctionData to properly encode the function call
                // This is more reliable than manually constructing the calldata
                const calldata = encodeFunctionData({
                  abi: contracts.governor.abi,
                  functionName: "propose",
                  args: inputData as any,
                });

                console.log("Encoded calldata:", calldata);

                // Create transaction data for the proposal creation function
                const transactions = [
                  {
                    to: getAddress(contracts.governor.address as string),
                    value: "0",
                    data: calldata,
                  },
                ];
                const nextNonce = await safeApiKit.getNextNonce(
                  selectedWalletAddress as `0x${string}`
                );
                // Create a Safe transaction
                const safeTransaction = await protocolKit.createTransaction({
                  transactions,
                  onlyCalls: true,
                  nonce: nextNonce,
                });

                // Get the transaction hash
                const safeTxHash =
                  await protocolKit.getTransactionHash(safeTransaction);

                // Sign transaction to verify that the transaction is coming from owner
                const senderSignature = await protocolKit.signHash(safeTxHash);
                console.log("senderSignature", safeTransaction);

                // Propose the transaction to the Safe
                await safeApiKit.proposeTransaction({
                  safeAddress: selectedWalletAddress as `0x${string}`,
                  safeTransactionData: safeTransaction.data,
                  safeTxHash: safeTxHash,
                  senderAddress: address as `0x${string}`,
                  senderSignature: senderSignature.data,
                });

                // Store the Safe transaction hash
                setSafeTxHash(safeTxHash);
                txHash = safeTxHash;
              } catch (error) {
                console.error("Safe transaction error:", error);
                throw error;
              }
            } else {
              // Regular EOA wallet transaction
              txHash = await writeAsync(config!.request);
            }

            if (!txHash) {
              // for dev
              console.log(error);
              return;
            }

            setProposalCreated(true);

            trackEvent({
              event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL,
              event_data: {
                transaction_hash: txHash,
                uses_plm: true,
                proposal_data: inputData,
              },
            });

            await sponsorDraftProposal({
              draftProposalId: draftProposal.id,
              onchain_transaction_hash: txHash,
            });
            openDialog({
              type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
              params: {
                redirectUrl: "/",
                txHash: safeTxHash || txHash,
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
