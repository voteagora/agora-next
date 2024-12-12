"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
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
  ProposalTypeMetadata,
  DraftProposal,
  PLMConfig,
} from "../../../types";
import { parseProposalToForm } from "../../../utils/parseTransaction";
import BasicProposalForm from "../../BasicProposalForm";
import SocialProposalForm from "../../SocialProposalForm";
import ApprovalProposalForm from "../../ApprovalProposalForm";
import OptimisticProposalForm from "../../OptimisticProposalForm";
import SwitchInput from "../../form/SwitchInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getStageIndexForTenant } from "@/app/proposals/draft/utils/stages";
import Tenant from "@/lib/tenant/tenant";

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
};

const getValidProposalTypesForVotingType = (
  proposalTypes: any[],
  proposalType: ProposalType
) => {
  switch (proposalType) {
    case ProposalType.APPROVAL:
      return proposalTypes.filter((type) => {
        return type.name.toLowerCase().includes("approval");
      });

    case ProposalType.OPTIMISTIC:
      return proposalTypes.filter((type) => {
        return type.name.toLowerCase().includes("optimistic");
      });

    case ProposalType.BASIC:
      return proposalTypes.filter((type) => {
        return (
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

const DraftFormClient = ({
  draftProposal,
  proposalTypes,
}: {
  draftProposal: DraftProposal;
  proposalTypes: any[];
}) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [validProposalTypes, setValidProposalTypes] = useState<any[]>(
    getValidProposalTypesForVotingType(proposalTypes, ProposalType.BASIC)
  );

  const router = useRouter();
  const { address } = useAccount();

  const { ui } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");

  const methods = useForm<z.output<typeof DraftProposalSchema>>({
    resolver: zodResolver(DraftProposalSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: parseProposalToForm(draftProposal) || DEFAULT_FORM,
  });

  const { watch, handleSubmit, control } = methods;

  const votingModuleType = watch("type");
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

  const onSubmit = async (data: z.output<typeof DraftProposalSchema>) => {
    setIsPending(true);

    try {
      if (!address) {
        toast("Account not connected.");
        return;
      }
      const res = await draftProposalAction({
        ...data,
        draftProposalId: draftProposal.id,
        creatorAddress: address,
      });
      if (!res.ok) {
        setIsPending(false);
        toast(res.message);
        return;
      } else {
        invalidatePath(draftProposal.id);
        router.push(
          `/proposals/draft/${draftProposal.id}?stage=${stageIndex + 1}`
        );
      }
    } catch (error: any) {
      setIsPending(false);
      console.error("An error was uncaught in `draftProposalAction`: ", error);
      toast(error.message);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormCard>
          <FormCard.Section>
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <SwitchInput
                  control={control}
                  label="Voting module"
                  required={true}
                  options={[
                    ...(
                      (plmToggle?.config as PLMConfig)?.proposalTypes || []
                    ).map((pt) => pt.type),
                  ]}
                  name="type"
                />

                <p className="text-sm self-center text-agora-stone-700 mt-6">
                  {ProposalTypeMetadata[votingModuleType].description}
                </p>
              </div>

              {validProposalTypes.length > 1 ? (
                <div className="relative">
                  <SelectInput
                    control={control}
                    label="Proposal type"
                    required={true}
                    options={validProposalTypes.map((typeConfig) => {
                      return {
                        label: typeConfig.name,
                        value: typeConfig.proposal_type_id,
                      };
                    })}
                    name="proposalConfigType"
                    emptyCopy="Default"
                  />
                </div>
              ) : (
                <input
                  type="hidden"
                  name="proposalConfigType"
                  value={validProposalTypes[0]?.proposal_type_id || null}
                />
              )}

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
                isSubmit={true}
                className="w-[200px] flex items-center justify-center"
                isLoading={isPending}
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
