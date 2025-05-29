"use client";

import { cx } from "@emotion/css";
import { Form } from "./CreateProposalForm";
import { AbiCoder, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSimulateContract,
  useWalletClient,
} from "wagmi";
import { useModal } from "connectkit";
import { disapprovalThreshold } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";
import { ProposalScope, ProposalType } from "@/app/proposals/draft/types";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import toast from "react-hot-toast";
import { createProposalAttestation } from "@/lib/eas";
import { getPublicClient } from "@/lib/viem";
import { BrowserProvider, JsonRpcSigner } from "ethers";

const { contracts, ui } = Tenant.current();
const abiCoder = new AbiCoder();
const governanceTokenContract = contracts.token;

export default function SubmitButton({
  formTarget,
  form,
}: {
  formTarget: React.RefObject<HTMLFormElement>;
  form: Form;
}) {
  const governorContract = contracts.governor;

  const { data: votingDelay } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingDelay",
    chainId: contracts.governor.chain.id,
  });

  const { data: votingPeriod } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingPeriod",
    chainId: contracts.governor.chain.id,
  });

  const {
    governorFunction,
    inputData,
    error: inputDataError,
  } = getInputData(form);
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  const { setOpen } = useModal();
  const [isClient, setIsClient] = useState(false);

  const [isOffchainSubmitting, setIsOffchainSubmitting] = useState(false);
  const [offchainSubmitError, setOffchainSubmitError] = useState<string | null>(
    null
  );

  const {
    data: config,
    isError: onPrepareError,
    error,
    refetch: refetchSimulateContract,
  } = useSimulateContract({
    address: governorContract.address as `0x${string}`,
    abi: governorContract.abi,
    functionName: governorFunction,
    args: inputData as any,
    query: {
      enabled:
        form.state.proposal_scope !== ProposalScope.OFFCHAIN_ONLY &&
        isConnected,
    },
  });

  const { data: manager } = useReadContract({
    address: governorContract.address as `0x${string}`,
    abi: governorContract.abi,
    functionName: "manager",
    chainId: governorContract.chain.id,
  });
  const {
    data: onchainTxData,
    isPending: isOnchainLoading,
    isSuccess: isOnchainSuccess,
    isError: isOnchainError,
    writeContractAsync: writeAsync,
  } = useWriteContract();

  const openDialog = useOpenDialog();

  useEffect(() => {
    if (
      form.state.proposal_scope !== ProposalScope.OFFCHAIN_ONLY &&
      (isOnchainSuccess || isOnchainError || isOnchainLoading || onchainTxData)
    ) {
      openDialog({
        type: "CAST_PROPOSAL",
        params: {
          isLoading: isOnchainLoading,
          isError: isOnchainError,
          isSuccess: isOnchainSuccess,
          txHash: onchainTxData,
        },
      });
    }
  }, [
    isOnchainLoading,
    isOnchainError,
    isOnchainSuccess,
    onchainTxData,
    openDialog,
    form.state.proposal_scope,
  ]);

  async function submitOffchainProposal() {
    if (!address || !walletClient || !chain) {
      setOffchainSubmitError(
        "Wallet not connected or chain information is missing."
      );
      return;
    }
    setIsOffchainSubmitting(true);
    setOffchainSubmitError(null);

    try {
      const network = {
        chainId: chain.id,
        name: chain.name,
      };
      const provider = new BrowserProvider(walletClient.transport, network);
      const signer = new JsonRpcSigner(provider, address);

      const fullDescription =
        "# " + form.state.title + "\n" + form.state.description;
      const choices = form.state.options.map((opt) => opt.title);

      const latestBlock = await getPublicClient().getBlockNumber();

      const startBlock = latestBlock + BigInt((votingDelay as any) ?? 0);
      const endBlock = startBlock + BigInt((votingPeriod as any) ?? 0);

      const rawProposalDataForBackend = {
        proposer: address,
        description: fullDescription,
        choices: choices,
        proposal_type_id: Number(form.state.proposalSettings),
        start_block: startBlock,
        end_block: endBlock,
      };

      const { id, transactionHash } = await createProposalAttestation({
        contract: governorContract.address as `0x${string}`,
        proposer: rawProposalDataForBackend.proposer,
        description: rawProposalDataForBackend.description,
        choices: rawProposalDataForBackend.choices,
        proposal_type_id: rawProposalDataForBackend.proposal_type_id,
        start_block: rawProposalDataForBackend.start_block.toString(),
        end_block: rawProposalDataForBackend.end_block.toString(),
        signer: signer,
      });

      const unformattedProposalData = getUnformattedProposalData(form);

      const apiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;

      if (!apiKey) {
        throw new Error("AGORA_API_KEY is not set");
      }

      const response = await fetch("/api/offchain-proposals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          proposalData: {
            proposer: rawProposalDataForBackend.proposer,
            description: rawProposalDataForBackend.description,
            choices: rawProposalDataForBackend.choices,
            proposal_type_id: rawProposalDataForBackend.proposal_type_id,
            start_block: rawProposalDataForBackend.start_block.toString(),
            end_block: rawProposalDataForBackend.end_block.toString(),
          },
          id,
          transactionHash,
          proposalType: form.state.proposalType.toLowerCase(),
          offchainOnly:
            form.state.proposal_scope === ProposalScope.OFFCHAIN_ONLY,
          moduleAddress: getProposalTypeAddress(
            form.state.proposalType.toLowerCase() as ProposalType
          ),
          unformattedProposalData,
          targets: form.state.options[0].transactions.map((t) => t.target),
          values: form.state.options[0].transactions.map(
            (t) => t.value.toString() || "0"
          ),
          calldatas: form.state.options[0].transactions.map((t) => t.calldata),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        toast.error(errorData.message || `API Error: ${response.status}`);
      }
      const result = await response.json();

      openDialog({
        type: "CAST_PROPOSAL",
        params: {
          isLoading: false,
          isError: false,
          isSuccess: true,
          txHash: result.transactionHash,
          isEas: true,
        },
      });
    } catch (e: any) {
      console.error("Off-chain proposal submission error:", e);
      setOffchainSubmitError(
        e.message || "Failed to submit off-chain proposal."
      );
      openDialog({
        type: "CAST_PROPOSAL",
        params: { isLoading: false, isError: true, isSuccess: false },
      });
    } finally {
      setIsOffchainSubmitting(false);
    }
  }

  async function submitOnchainProposal() {
    if (!writeAsync || !config?.request) {
      console.error("On-chain submission not ready");
      return;
    }
    const txHash = await writeAsync(config!.request);
    trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL,
      event_data: {
        transaction_hash: txHash,
        uses_plm: false,
        proposal_data: inputData,
      },
    });
  }

  async function handleSubmit() {
    if (!isConnected) {
      setOpen(true);
      return;
    }

    if (!formTarget.current?.checkValidity()) {
      formTarget.current?.reportValidity();
      return;
    }

    setOffchainSubmitError(null);

    if (form.state.proposal_scope === ProposalScope.OFFCHAIN_ONLY) {
      submitOffchainProposal();
    } else {
      if (onPrepareError || !!inputDataError) {
        console.error(
          "On-chain pre-flight check failed:",
          error,
          inputDataError
        );
        return;
      }
      if (form.state.proposal_scope === ProposalScope.ONCHAIN_ONLY) {
        submitOnchainProposal();
      } else {
        await submitOnchainProposal();
        await submitOffchainProposal();
      }
    }
  }

  /* hack to suppress Suspense boundary error */
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Refetch simulateContract when form data changes for on-chain proposals
  useEffect(() => {
    if (
      form.state.proposal_scope !== ProposalScope.OFFCHAIN_ONLY &&
      isConnected
    ) {
      refetchSimulateContract();
    }
  }, [
    form.state,
    isConnected,
    form.state.proposal_scope,
    refetchSimulateContract,
  ]);

  const isOffChainOnly =
    form.state.proposal_scope === ProposalScope.OFFCHAIN_ONLY;

  const buttonDisabled =
    (isOffChainOnly
      ? isOffchainSubmitting
      : isOnchainLoading || onPrepareError || !!inputDataError) || !isConnected;

  return (
    <>
      {manager && String(manager) !== address ? (
        <p className="text-secondary text-sm max-w-[420px] break-words">
          Only the {ui.organization!.title} manager address can create proposals
          for the time being.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {!!inputDataError && (
            <p className="text-secondary text-sm max-w-[420px] break-words">
              {(inputDataError as { message?: string })?.message ||
                JSON.stringify(inputDataError)}
            </p>
          )}
          {onPrepareError && (
            <p className="text-danger-default text-sm max-w-[420px] break-words">
              {(error as any)?.shortMessage ||
                (error as any)?.message ||
                JSON.stringify(error)}
            </p>
          )}
          {!!offchainSubmitError && (
            <p className="text-danger-default text-sm max-w-[420px] break-words">
              {offchainSubmitError}
            </p>
          )}
        </div>
      )}
      <Button
        type="submit"
        variant={"outline"}
        disabled={buttonDisabled}
        className={cx([
          "w-[40%]",
          buttonDisabled && "cursor-not-allowed bg-line",
        ])}
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* hack to suppress Suspense boundary error */}
        {isClient && isConnected ? "Submit proposal" : "Connect wallet"}
      </Button>
    </>
  );
}

type BasicInputData = [string[], bigint[], string[], string, Number];
type ApprovalInputData = [string, string, string, Number];
type InputData = BasicInputData | ApprovalInputData;

function getInputData(form: Form): {
  governorFunction: "propose" | "proposeWithModule";
  inputData: InputData;
  error: unknown;
} {
  const tenant = Tenant.current();
  let error = null;
  const description = "# " + form.state.title + "\n" + form.state.description;
  let governorFunction: "propose" | "proposeWithModule" = "propose";

  // provide default values for basic proposal
  let targets: string[] = [];
  let values: bigint[] = [];
  let calldatas: string[] = [];

  let proposalSettings = Number(form.state.proposalSettings); // index as uint8 as last argument on propose and proposeWithModule
  let inputData: InputData = [
    targets,
    values,
    calldatas,
    description,
    proposalSettings,
  ];

  try {
    // if basic proposal, format data for basic proposal
    if (form.state.proposalType === "Basic") {
      governorFunction = "propose";

      if (form.state.options[0].transactions.length === 0) {
        targets.push(ethers.ZeroAddress);
        values.push(BigInt(0));
        calldatas.push("0x");
      } else {
        form.state.options[0].transactions.forEach((t) => {
          if (t.type === "Transfer") {
            targets.push(governanceTokenContract.address);
            values.push(BigInt(0));
            calldatas.push(encodeTransfer(t.transferTo, t.transferAmount));
          } else {
            targets.push(ethers.getAddress(t.target));
            values.push(ethers.parseEther(t.value.toString() || "0"));
            calldatas.push(t.calldata);
          }
        });
      }
    } else if (form.state.proposalType === "Approval") {
      // if APPROVAL proposal, format data for approval proposal
      governorFunction = "proposeWithModule";
      // first bigint is the sum of all op transfer per option
      const options = formatApprovalOptions(form);

      const settings = [
        form.state.maxOptions,
        form.state.criteriaType === "Threshold" ? 0 : 1,
        form.state.budget > 0
          ? governanceTokenContract.address
          : ethers.ZeroAddress,
        form.state.criteriaType === "Threshold"
          ? ethers.parseEther(form.state.threshold.toString())
          : form.state.topChoices,
        ethers.parseEther(form.state.budget.toString()),
      ];

      const approvalModuleAddress = getProposalTypeAddress(
        ProposalType.APPROVAL
      );

      if (!approvalModuleAddress) {
        throw new Error(
          `Approval module address not found for tenant ${tenant.namespace}`
        );
      }

      inputData = [
        approvalModuleAddress,
        abiCoder.encode(
          [
            "tuple(uint256,address[],uint256[],bytes[],string)[]",
            "tuple(uint8,uint8,address,uint128,uint128)",
          ],
          [options, settings]
        ),
        description,
        proposalSettings,
      ];
    } else if (form.state.proposalType === "Optimistic") {
      // if OPTIMISTIC proposal, format data for optimistic proposal
      governorFunction = "proposeWithModule";

      const settings = [disapprovalThreshold * 100, true];

      const optimisticModuleAddress = getProposalTypeAddress(
        ProposalType.OPTIMISTIC
      );

      if (!optimisticModuleAddress) {
        throw new Error(
          `Optimistic module address not found for tenant ${tenant.namespace}`
        );
      }

      inputData = [
        optimisticModuleAddress,
        abiCoder.encode(["tuple(uint248,bool)"], [settings]),
        description,
        proposalSettings,
      ];
    }
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { governorFunction, inputData, error };
}

function encodeTransfer(to: string, amount: bigint): string {
  return (
    "0xa9059cbb" +
    abiCoder
      .encode(["address", "uint256"], [ethers.getAddress(to), amount])
      .slice(2)
  );
}

const formatApprovalOptions = (form: Form) => {
  let options: [bigint, string[], bigint[], string[], string][] = [];

  form.state.options.forEach((option) => {
    const formattedOption: [bigint, string[], bigint[], string[], string] = [
      BigInt(0),
      [],
      [],
      [],
      option.title,
    ];

    option.transactions.forEach((t) => {
      if (t.type === "Transfer") {
        formattedOption[0] += t.transferAmount;
        formattedOption[1].push(governanceTokenContract.address);
        formattedOption[2].push(BigInt(0));
        formattedOption[3].push(encodeTransfer(t.transferTo, t.transferAmount));
      } else {
        formattedOption[1].push(ethers.getAddress(t.target));
        formattedOption[2].push(ethers.parseEther(t.value.toString() || "0"));
        formattedOption[3].push(t.calldata);
      }
    });

    options.push(formattedOption);
  });

  return options;
};

const getUnformattedProposalData = (form: Form) => {
  if (form.state.proposalType === "Approval") {
    const options = formatApprovalOptions(form);

    const settings = [
      form.state.maxOptions,
      form.state.criteriaType === "Threshold" ? 0 : 1,
      form.state.budget > 0
        ? governanceTokenContract.address
        : ethers.ZeroAddress,
      form.state.criteriaType === "Threshold"
        ? ethers.parseEther(form.state.threshold.toString())
        : form.state.topChoices,
      ethers.parseEther(form.state.budget.toString()),
    ];

    return abiCoder.encode(
      [
        "tuple(uint256,address[],uint256[],bytes[],string)[]",
        "tuple(uint8,uint8,address,uint128,uint128)",
      ],
      [options, settings]
    );
  } else if (form.state.proposalType === "Optimistic") {
    const settings = [disapprovalThreshold * 100, true];
    return abiCoder.encode(["tuple(uint248,bool)"], [settings]);
  }
};
