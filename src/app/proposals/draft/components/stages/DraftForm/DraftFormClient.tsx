"use client";

import { useAccount, useSignMessage } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import FormCard from "../../form/FormCard";
import TextInput from "../../form/TextInput";
import SelectInput from "../../form/SelectInput";
import MarkdownTextareaInput from "../../form/MarkdownTextareaInput";
import { UpdatedButton } from "@/components/Button";
import { DraftProposalSchema } from "../../../schemas/DraftProposalSchema";
import { onSubmitAction as draftProposalAction } from "../../../actions/createDraftProposal";
import { invalidatePath } from "../../../actions/revalidatePath";
import {
  ProposalType,
  SocialProposalType,
  parseProposalToForm,
  DraftProposal,
  ProposalScope,
} from "../../../types";
import BasicProposalForm from "../../BasicProposalForm";
import SocialProposalForm from "../../SocialProposalForm";
import ApprovalProposalForm from "../../ApprovalProposalForm";
import OptimisticProposalForm from "../../OptimisticProposalForm";
import SwitchInput from "../../form/SwitchInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  getProposalTypeAddress,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import { getProposalTypeMetaDataForTenant } from "../../../utils/proposalTypes";
import { ScopeDetails } from "@/components/Admin/ScopeDetails";
import { FormattedProposalType } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import JointHouseSettings from "@/app/proposals/draft/components/JointHouseSettings";
import TiersSettings from "@/app/proposals/draft/components/TiersSettings";
import { TENANT_NAMESPACES, LOCAL_STORAGE_SIWE_JWT_KEY } from "@/lib/constants";

const { ui, namespace } = Tenant.current();

const ProposalTypeMetadata = {
  [ProposalType.SOCIAL]: {
    title: "Social Proposal",
    description: "A proposal that resolves via a snapshot vote.",
  },
  [ProposalType.BASIC]: {
    title: "Basic Proposal",
    description:
      namespace === "optimism"
        ? "Voters are asked to vote for, against, or abstain. The proposal passes if the for votes exceed quorum AND if the for votes exceed the approval threshold."
        : "Voters are asked to vote for, against, or abstain. The proposal passes if the abstain and for votes exceeed quorum AND if the for votes exceed the approval threshold.",
  },
  [ProposalType.APPROVAL]: {
    title: "Approval Proposal",
    description:
      "Voters are asked to choose among multiple options. If the proposal passes quorum, options will be approved according to the approval criteria.",
  },
  [ProposalType.OPTIMISTIC]: {
    title: "Optimistic Proposal",
    description:
      "Voters are asked to vote for, against, or abstain. The proposal automatically passes unless 12% vote against. No transactions can be proposed for optimistic proposals, it can only be used for social signaling.",
  },
} as {
  [key in ProposalType]: {
    title: string;
    description: string;
  };
};

const getProposalMetadataDescription = (
  proposalType: ProposalType,
  includeAbstain = true
) => {
  if (
    proposalType === ProposalType.BASIC &&
    namespace === TENANT_NAMESPACES.OPTIMISM
  ) {
    if (!includeAbstain) {
      return "Voters are asked to vote for, against, or abstain. The proposal passes if the for votes exceed quorum AND if the for votes, relative to the total votes, exceed the approval threshold. ⚠️ This option is currently not supported by the governor contract. This warning can be ignored (and will be removed) after the governor contract is upgraded. ⚠️";
    } else {
      return "Voters are asked to vote for, against, or abstain. The proposal passes if the for and abstain votes exceed quorum AND if the for votes, relative to the total votes, exceed the approval threshold. This option is currently supported by the governor contract.";
    }
  }
  return ProposalTypeMetadata[proposalType].description;
};

const DEFAULT_FORM = {
  type: ProposalType.BASIC,
  title: "",
  abstract: "",
  transactions: [],
  socialProposal: {
    type: SocialProposalType.BASIC,
    start_date: undefined,
    end_date: undefined,
    options: [],
  },
  proposal_scope: ProposalScope.ONCHAIN_ONLY,
  budget: 0,
  calculationOptions: 0,
};

const getValidProposalTypesForVotingType = (
  proposalTypes: any[],
  proposalType: ProposalType
) => {
  let optimisticModuleAddress: string | null = null;
  let approvalModuleAddress: string | null = null;

  try {
    optimisticModuleAddress =
      getProposalTypeAddress(ProposalType.OPTIMISTIC)?.toLowerCase() || null;

    approvalModuleAddress =
      getProposalTypeAddress(ProposalType.APPROVAL)?.toLowerCase() || null;
  } catch (error) {
    // ignore
  }

  switch (proposalType) {
    case ProposalType.APPROVAL:
      return proposalTypes.filter((type) => {
        return (
          (type.module &&
            type.module.toLowerCase() ===
              approvalModuleAddress?.toLowerCase()) ||
          type.name.toLowerCase().includes("approval")
        );
      });

    case ProposalType.OPTIMISTIC:
      return proposalTypes.filter((type) => {
        return (
          (type.module &&
            type.module.toLowerCase() ===
              optimisticModuleAddress?.toLowerCase()) ||
          type.name.toLowerCase().includes("optimistic")
        );
      });

    case ProposalType.BASIC:
      return proposalTypes.filter((type) => {
        return (
          (!type.module ||
            type.module?.toLowerCase() !==
              approvalModuleAddress?.toLowerCase()) &&
          (!type.module ||
            type.module?.toLowerCase() !==
              optimisticModuleAddress?.toLowerCase()) &&
          !type.name.toLowerCase().includes("approval") &&
          !type.name.toLowerCase().includes("optimistic")
        );
      });

    // currently no constraints on these voting modules
    case ProposalType.SOCIAL:
    default:
      return proposalTypes;
  }
};

const offchainProposals = ui.toggle("proposals/offchain")?.enabled;

const DraftFormClient = ({
  draftProposal,
  proposalTypes,
}: {
  draftProposal: DraftProposal;
  proposalTypes: FormattedProposalType[];
}) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [validProposalTypes, setValidProposalTypes] = useState<any[]>(
    getValidProposalTypesForVotingType(proposalTypes, ProposalType.BASIC)
  );
  const router = useRouter();
  const { address } = useAccount();
  const messageSigner = useSignMessage();

  const methods = useForm<z.output<typeof DraftProposalSchema>>({
    resolver: zodResolver(DraftProposalSchema),
    mode: "onBlur",
    defaultValues: parseProposalToForm(draftProposal) || DEFAULT_FORM,
  });

  const { watch, handleSubmit, control } = methods;

  const votingModuleType = watch("type");
  const proposalTypeId = watch("proposalConfigType");
  const calculationOptions = watch("calculationOptions");
  const enabledProposalTypesFromConfigAndAPI = useMemo(
    () => getProposalTypeMetaDataForTenant(proposalTypes),
    [proposalTypes]
  );
  const stageIndex = getStageIndexForTenant("DRAFTING") as number;

  useEffect(() => {
    const newValidProposalTypes = getValidProposalTypesForVotingType(
      proposalTypes,
      votingModuleType
    );

    setValidProposalTypes(newValidProposalTypes);

    if (newValidProposalTypes.length > 0) {
      methods.setValue(
        "proposalConfigType",
        newValidProposalTypes[0].proposal_type_id
      );
    }
  }, [votingModuleType, proposalTypes, methods]);

  // Ensure proposalConfigType is set when returning from other stages
  useEffect(() => {
    const current = methods.getValues("proposalConfigType");
    if (!current && validProposalTypes.length > 0) {
      methods.setValue(
        "proposalConfigType",
        validProposalTypes[0].proposal_type_id
      );
    }
  }, [validProposalTypes, methods]);

  const onSubmit = async (data: z.output<typeof DraftProposalSchema>) => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      if (!address) {
        toast("Account not connected.");
        return;
      }
      // Guard: require SIWE JWT before prompting signature for this action
      try {
        const session = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
        if (!session) {
          toast("Session expired. Please sign in to continue.");
          window.location.reload();
          return;
        }
      } catch {
        toast("Session expired. Please sign in to continue.");
        window.location.reload();
        return;
      }
      const messagePayload = {
        action: "updateDraft",
        draftProposalId: draftProposal.id,
        creatorAddress: address,
        timestamp: new Date().toISOString(),
      };
      const message = JSON.stringify(messagePayload);
      const signature = await messageSigner
        .signMessageAsync({ message })
        .catch(() => undefined);
      if (!signature) {
        setIsPending(false);
        toast("Signature failed");
        return;
      }

      const res = await draftProposalAction({
        ...data,
        draftProposalId: draftProposal.id,
        creatorAddress: address,
        message,
        signature,
      });
      if (!res.ok) {
        setIsPending(false);
        toast(res.message);
        return;
      } else {
        invalidatePath(draftProposal.id);
        const nextId = draftProposal.uuid;
        router.push(`/proposals/draft/${nextId}?stage=${stageIndex + 1}`);
      }
    } catch (error: any) {
      setIsPending(false);
      console.error("An error was uncaught in `draftProposalAction`: ", error);
      toast(error.message || "An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const selectedProposalType = useMemo(() => {
    return proposalTypes.find(
      (type) => type.proposal_type_id === Number(proposalTypeId)
    );
  }, [proposalTypeId]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormCard>
          <FormCard.Section>
            <div className="flex flex-col space-y-6">
              {offchainProposals ? <JointHouseSettings form={methods} /> : null}
              {validProposalTypes.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SwitchInput
                    control={control}
                    label="Voting module"
                    required={true}
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
                  required={true}
                  options={validProposalTypes.map((typeConfig) => {
                    return {
                      label: `${typeConfig.name} (${typeConfig.quorum / 100}% Quorum, ${typeConfig.approval_threshold / 100}% Approval)`,
                      value: typeConfig.proposal_type_id,
                    };
                  })}
                  name="proposalConfigType"
                  emptyCopy="Default"
                />
              </div>

              {(selectedProposalType?.scopes?.length || 0) > 0 && (
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
                required={true}
                control={methods.control}
              />
              <MarkdownTextareaInput
                control={methods.control}
                label="Description"
                required={true}
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
                  const exhaustiveCheck: never = votingModuleType;
                  return exhaustiveCheck;
              }
            })()}
          </FormCard.Section>
          <FormCard.Section>
            <div className="flex flex-row justify-between space-x-4">
              <UpdatedButton
                fullWidth={true}
                type="primary"
                isSubmit={false}
                className="w-[200px] flex items-center justify-center"
                isLoading={isPending}
                onClick={handleSubmit(onSubmit)}
              >
                {draftProposal.title ? "Update draft" : "Create draft"}
              </UpdatedButton>
            </div>
          </FormCard.Section>
        </FormCard>
      </form>
    </FormProvider>
  );
};

export default DraftFormClient;
