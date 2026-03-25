"use client";

import { useAccount, useReadContract, useWalletClient } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useWriteContract } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import FormCard from "@/app/proposals/draft/components/form/FormCard";
import TextInput from "@/app/proposals/draft/components/form/TextInput";
import SelectInput from "@/app/proposals/draft/components/form/SelectInput";
import MarkdownTextareaInput from "@/app/proposals/draft/components/form/MarkdownTextareaInput";
import { UpdatedButton } from "@/components/Button";
import { DraftProposalSchema } from "@/app/proposals/draft/schemas/DraftProposalSchema";
import {
  PLMConfig,
  ProposalScope,
  ProposalType,
} from "@/app/proposals/draft/types";
import BasicProposalForm from "@/app/proposals/draft/components/BasicProposalForm";
import SocialProposalForm from "@/app/proposals/draft/components/SocialProposalForm";
import ApprovalProposalForm from "@/app/proposals/draft/components/ApprovalProposalForm";
import OptimisticProposalForm from "@/app/proposals/draft/components/OptimisticProposalForm";
import SwitchInput from "@/app/proposals/draft/components/form/SwitchInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getProposalTypeMetaDataForTenant } from "@/app/proposals/draft/utils/proposalTypes";
import {
  DEFAULT_FORM,
  getProposalMetadataDescription,
  getValidProposalTypesForVotingType,
} from "@/app/proposals/draft/utils/formConstants";
import { ScopeDetails } from "@/components/Admin/ScopeDetails";
import { FormattedProposalType } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import { getDefaultGovernor } from "@/lib/tenant/governorUtils";
import JointHouseSettings from "@/app/proposals/draft/components/JointHouseSettings";
import TiersSettings from "@/app/proposals/draft/components/TiersSettings";
import { formDataToProposal } from "@/app/proposals/draft/utils/formDataToProposal";
import { getInputData } from "@/app/proposals/draft/utils/getInputData";
import { trackEvent } from "@/lib/analytics";
import {
  ANALYTICS_EVENT_NAMES,
  ProposalType as LibProposalType,
} from "@/lib/types.d";
import { createProposalAttestation } from "@/lib/eas";
import { createOffchainProposal } from "@/app/api/offchain-proposals/actions";
import { generateProposalId } from "@/lib/seatbelt/simulate";
import { getPublicClient } from "@/lib/viem";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

const { ui } = Tenant.current();
const offchainProposals = ui.toggle("proposals/offchain")?.enabled;
const plmConfig = ui.toggle("proposal-lifecycle")?.config as PLMConfig;

export default function CreateProposalFormClient({
  proposalTypes,
}: {
  proposalTypes: FormattedProposalType[];
}) {
  const [isOnchainPending, setIsOnchainPending] = useState(false);
  const [isOffchainPending, setIsOffchainPending] = useState(false);
  const [validProposalTypes, setValidProposalTypes] = useState<
    FormattedProposalType[]
  >(getValidProposalTypesForVotingType(proposalTypes, ProposalType.BASIC));

  const router = useRouter();
  const openDialog = useOpenDialog();
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { contracts } = Tenant.current();
  const defaultGovernor = getDefaultGovernor(contracts);
  const { writeContractAsync, isPending: isWriteLoading } = useWriteContract();
  const { getAuthenticationData } = useProposalActionAuth();

  const { data: votingDelay } = useReadContract({
    address: defaultGovernor.governor.address as `0x${string}`,
    abi: defaultGovernor.governor.abi,
    functionName: "votingDelay",
    chainId: defaultGovernor.governor.chain.id,
  });

  const { data: votingPeriod } = useReadContract({
    address: defaultGovernor.governor.address as `0x${string}`,
    abi: defaultGovernor.governor.abi,
    functionName: "votingPeriod",
    chainId: defaultGovernor.governor.chain.id,
  });

  const methods = useForm<z.output<typeof DraftProposalSchema>>({
    resolver: zodResolver(DraftProposalSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_FORM as z.output<typeof DraftProposalSchema>,
  });

  const { watch, handleSubmit, control } = methods;
  const votingModuleType = watch("type");
  const proposalTypeId = watch("proposalConfigType");
  const calculationOptions = watch("calculationOptions");
  const proposalScope = watch("proposal_scope");

  const enabledProposalTypesFromConfigAndAPI = useMemo(
    () => getProposalTypeMetaDataForTenant(proposalTypes),
    [proposalTypes]
  );

  useEffect(() => {
    setValidProposalTypes(
      getValidProposalTypesForVotingType(proposalTypes, votingModuleType)
    );
  }, [votingModuleType, proposalTypes]);

  useEffect(() => {
    const current = methods.getValues("proposalConfigType");
    if (
      (!current ||
        !validProposalTypes.some(
          (type) => type.proposal_type_id === Number(current)
        )) &&
      validProposalTypes.length > 0
    ) {
      methods.setValue(
        "proposalConfigType",
        validProposalTypes[0].proposal_type_id.toString()
      );
    }
  }, [validProposalTypes, methods]);

  const isOffchainScope =
    proposalScope === ProposalScope.OFFCHAIN_ONLY ||
    proposalScope === ProposalScope.HYBRID;
  const isHybrid = proposalScope === ProposalScope.HYBRID;
  const canSubmitOffchain =
    isOffchainScope &&
    plmConfig?.offchainProposalCreator?.includes(address ?? "");

  const submitOffchain = async (
    proposal: ReturnType<typeof formDataToProposal>,
    onchainProposalId: bigint | null
  ) => {
    if (!address || !walletClient || !chain) {
      throw new Error("Wallet not connected or chain information is missing.");
    }
    if (!canSubmitOffchain) {
      throw new Error("You are not authorized to submit offchain proposals.");
    }
    const fullDescription = "# " + proposal.title + "\n" + proposal.abstract;
    const choices =
      proposal.voting_module_type === ProposalType.APPROVAL
        ? proposal.approval_options.map((opt) => opt.title)
        : [];

    const latestBlock = await getPublicClient().getBlockNumber();
    const startBlock = latestBlock + BigInt((votingDelay as number) ?? 0);
    const endBlock = startBlock + BigInt((votingPeriod as number) ?? 0);

    const tiersEnabled =
      (proposal.tiers?.length ?? 0) > 0 &&
      proposal.voting_module_type === ProposalType.OPTIMISTIC &&
      proposal.proposal_scope !== ProposalScope.ONCHAIN_ONLY;

    const parsedProposalType = (
      tiersEnabled
        ? "OPTIMISTIC_TIERED"
        : proposal.voting_module_type === ProposalType.BASIC
          ? "STANDARD"
          : proposal.voting_module_type?.toUpperCase()
    ) as LibProposalType;

    const rawProposalDataForBackend = {
      proposer: address,
      description: fullDescription,
      choices,
      proposal_type_id: Number(proposal.proposal_type),
      start_block: startBlock,
      end_block: endBlock,
      proposal_type: parsedProposalType,
      tiers: tiersEnabled ? (proposal.tiers ?? []) : [],
      maxApprovals: proposal.max_options ?? 0,
      criteria: proposal.criteria
        ? proposal.criteria === "Threshold"
          ? 0
          : 1
        : 99,
      criteriaValue: proposal.criteria
        ? proposal.criteria === "Threshold"
          ? (proposal.threshold ?? 0)
          : (proposal.top_choices ?? 0)
        : 0,
      calculationOptions: proposal.calculationOptions ?? 0,
    };

    const messagePayload = {
      action: "createOffchainProposal",
      proposer: address,
      timestamp: new Date().toISOString(),
    };
    const authData = await getAuthenticationData(messagePayload);
    if (!authData) {
      throw new Error("Authentication failed");
    }

    const network = { chainId: chain.id, name: chain.name };
    const provider = new BrowserProvider(walletClient.transport, network);
    const signer = new JsonRpcSigner(provider, address);

    const { id, transactionHash: attestationTxHash } =
      await createProposalAttestation({
        contract: defaultGovernor.governor.address as `0x${string}`,
        proposer: rawProposalDataForBackend.proposer,
        description: rawProposalDataForBackend.description,
        choices: rawProposalDataForBackend.choices,
        proposal_type_id: rawProposalDataForBackend.proposal_type_id,
        start_block: rawProposalDataForBackend.start_block.toString(),
        end_block: rawProposalDataForBackend.end_block.toString(),
        proposal_type: parsedProposalType,
        tiers: rawProposalDataForBackend.tiers,
        signer,
        onchain_proposalid: onchainProposalId,
        maxApprovals: rawProposalDataForBackend.maxApprovals,
        criteria: rawProposalDataForBackend.criteria,
        criteriaValue: rawProposalDataForBackend.criteriaValue,
        calculationOptions: rawProposalDataForBackend.calculationOptions,
      });

    await createOffchainProposal({
      proposalData: {
        proposer: rawProposalDataForBackend.proposer,
        description: rawProposalDataForBackend.description,
        choices: rawProposalDataForBackend.choices,
        proposal_type_id: rawProposalDataForBackend.proposal_type_id,
        start_block: rawProposalDataForBackend.start_block.toString(),
        end_block: rawProposalDataForBackend.end_block.toString(),
        proposal_type: parsedProposalType,
        tiers: rawProposalDataForBackend.tiers,
        maxApprovals: rawProposalDataForBackend.maxApprovals,
        criteria: rawProposalDataForBackend.criteria,
        criteriaValue: rawProposalDataForBackend.criteriaValue,
        calculationOptions: rawProposalDataForBackend.calculationOptions,
      },
      id: id.toString(),
      transactionHash: attestationTxHash,
      onchainProposalId: onchainProposalId?.toString() ?? null,
      auth: {
        jwt: authData.jwt,
        message: authData.message,
        signature: authData.signature as `0x${string}` | undefined,
      },
    });

    return attestationTxHash as `0x${string}`;
  };

  const onSubmitOnchain = async (
    data: z.output<typeof DraftProposalSchema>
  ) => {
    if (isOnchainPending) return;
    if (!address) {
      toast.error("Connect your wallet");
      return;
    }
    if (data.type === ProposalType.SOCIAL) {
      toast.error(
        "Social proposals use Snapshot. Use the normal proposal flow."
      );
      return;
    }
    setIsOnchainPending(true);
    try {
      const proposal = formDataToProposal(data);
      const { inputData } = getInputData(proposal);
      if (!inputData) {
        toast.error("Could not build proposal calldata");
        return;
      }
      const functionName =
        data.type === ProposalType.BASIC ? "propose" : "proposeWithModule";
      const txHash = await writeContractAsync({
        address: defaultGovernor.governor.address as `0x${string}`,
        abi: defaultGovernor.governor.abi,
        functionName,
        args: inputData as never,
      });
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL,
        event_data: {
          transaction_hash: txHash,
          uses_plm: false,
          proposal_data: inputData,
        },
      });
      toast.success(
        isHybrid
          ? "Step 1 complete. Submit offchain to finish."
          : "Proposal created. It might take a few minutes for the proposal to be indexed and appear.",
        {
          duration: 10000,
        }
      );
      if (!isHybrid) router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsOnchainPending(false);
    }
  };

  const onSubmitOffchain = async (
    data: z.output<typeof DraftProposalSchema>
  ) => {
    if (isOffchainPending) return;
    if (!address) {
      toast.error("Connect your wallet");
      return;
    }
    if (!canSubmitOffchain) {
      toast.error("You are not authorized to submit offchain proposals.");
      return;
    }
    setIsOffchainPending(true);
    try {
      const proposal = formDataToProposal(data);
      const { inputData } = getInputData(proposal);
      if (!inputData) {
        toast.error("Could not build proposal calldata");
        return;
      }
      let onchainProposalId: bigint | null = null;
      if (isHybrid) {
        const proposalType = proposal.voting_module_type.toLowerCase() as
          | "basic"
          | "approval"
          | "optimistic";
        const targets = proposalType === "basic" ? (inputData as any)[0] : [];
        const values =
          proposalType === "basic"
            ? ((inputData as any)[1] as number[]).map(BigInt)
            : [];
        const calldatas = proposalType === "basic" ? (inputData as any)[2] : [];
        const description =
          proposalType === "basic"
            ? (inputData as any)[3]
            : (inputData as any)[2];
        const moduleAddress =
          proposalType !== "basic" ? (inputData as any)[0] : undefined;
        const unformattedProposalData =
          proposalType !== "basic" ? (inputData as any)[1] : undefined;
        onchainProposalId = await generateProposalId({
          targets,
          values,
          calldatas,
          description,
          proposalType,
          unformattedProposalData,
          moduleAddress,
        });
      }
      const txHash = await submitOffchain(proposal, onchainProposalId);
      toast.success("Proposal submitted successfully");
      openDialog({
        type: "SPONSOR_OFFCHAIN_DRAFT_PROPOSAL",
        params: {
          redirectUrl: "/",
          txHash,
        },
      });
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsOffchainPending(false);
    }
  };

  const selectedProposalType = useMemo(
    () =>
      proposalTypes.find(
        (type) => type.proposal_type_id === Number(proposalTypeId)
      ),
    [proposalTypeId, proposalTypes]
  );

  const isOnchainLoading = isOnchainPending || isWriteLoading;

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()}>
        <FormCard>
          <FormCard.Section>
            <div className="flex flex-col space-y-6">
              {offchainProposals ? <JointHouseSettings form={methods} /> : null}
              {validProposalTypes.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SwitchInput
                    control={control}
                    label=""
                    required
                    options={enabledProposalTypesFromConfigAndAPI}
                    name="type"
                  />
                  <p className="text-sm self-center text-agora-stone-700 mt-6">
                    {getProposalMetadataDescription(
                      votingModuleType,
                      calculationOptions === 0
                    )}
                  </p>
                </div>
              )}
              <div className="relative">
                <SelectInput
                  control={control}
                  label="Proposal type"
                  required
                  options={validProposalTypes.map((typeConfig) => ({
                    label: `${typeConfig.name} (${typeConfig.quorum / 100}% Quorum, ${typeConfig.approval_threshold / 100}% Approval)`,
                    value: typeConfig.proposal_type_id.toString(),
                  }))}
                  name="proposalConfigType"
                  emptyCopy="Default"
                />
              </div>
              {(selectedProposalType?.scopes?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Scopes</span>
                  {selectedProposalType?.scopes?.map((scope) => (
                    <div
                      key={scope.scope_key}
                      className="flex flex-col gap-4 text-sm border border-line rounded-lg p-4 w-full"
                    >
                      <ScopeDetails scope={scope} />
                    </div>
                  ))}
                </div>
              )}
              <TiersSettings form={methods} />
              <TextInput
                label="Title"
                name="title"
                required
                control={methods.control}
              />
              <MarkdownTextareaInput
                control={methods.control}
                label="Description"
                required
                name="abstract"
              />
            </div>
          </FormCard.Section>
          <FormCard.Section>
            {(() => {
              switch (votingModuleType) {
                case ProposalType.BASIC:
                  return <BasicProposalForm />;
                case ProposalType.SOCIAL:
                  return <SocialProposalForm />;
                case ProposalType.APPROVAL:
                  return <ApprovalProposalForm />;
                case ProposalType.OPTIMISTIC:
                  return <OptimisticProposalForm />;
                default:
                  return null;
              }
            })()}
          </FormCard.Section>
          <FormCard.Section>
            {isHybrid && (
              <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Hybrid Proposal
                </h3>
                <p className="text-sm text-blue-800">
                  This proposal will be submitted both on-chain and off-chain.
                  Voting will occur across both platforms.
                </p>
              </div>
            )}
            <div className="space-y-4">
              {(proposalScope === ProposalScope.ONCHAIN_ONLY || isHybrid) && (
                <div>
                  {isHybrid && (
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Step 1: Submit on-chain
                    </h4>
                  )}
                  <UpdatedButton
                    fullWidth
                    type="primary"
                    isSubmit={false}
                    className="w-[200px] flex items-center justify-center"
                    isLoading={isOnchainLoading}
                    disabled={votingModuleType === ProposalType.SOCIAL}
                    onClick={handleSubmit(onSubmitOnchain)}
                  >
                    {isHybrid ? "Submit on-chain" : "Create proposal"}
                  </UpdatedButton>
                </div>
              )}
              {(proposalScope === ProposalScope.OFFCHAIN_ONLY || isHybrid) && (
                <div>
                  {isHybrid && (
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Step 2: Submit off-chain
                    </h4>
                  )}
                  <UpdatedButton
                    fullWidth
                    type="primary"
                    isSubmit={false}
                    className="w-[200px] flex items-center justify-center"
                    isLoading={isOffchainPending}
                    onClick={handleSubmit(onSubmitOffchain)}
                  >
                    Submit offchain proposal
                  </UpdatedButton>
                </div>
              )}
            </div>
          </FormCard.Section>
        </FormCard>
      </form>
    </FormProvider>
  );
}
