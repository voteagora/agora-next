"use client";

import { useAccount } from "wagmi";
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
  DraftVotingModuleType,
  parseProposalToForm,
  DraftProposal,
} from "../../../types";
import BasicProposalForm from "../../BasicProposalForm";
import SocialProposalForm from "../../SocialProposalForm";
import ApprovalProposalForm from "../../ApprovalProposalForm";
import OptimisticProposalForm from "../../OptimisticProposalForm";
import SwitchInput from "../../form/SwitchInput";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { getStageIndexForTenant } from "@/app/proposals/draft/utils/stages";
import { buildDraftUrl } from "@/app/proposals/draft/utils/shareParam";
import { getProposalTypeMetaDataForTenant } from "../../../utils/proposalTypes";
import {
  DEFAULT_FORM,
  getProposalMetadataDescription,
  getValidProposalTypesForVotingType,
} from "@/app/proposals/draft/utils/formConstants";
import { ScopeDetails } from "@/components/Admin/ScopeDetails";
import { FormattedProposalType } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import JointHouseSettings from "@/app/proposals/draft/components/JointHouseSettings";
import TiersSettings from "@/app/proposals/draft/components/TiersSettings";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";
import { toAuthoringProposalTypeSelectOption } from "@/features/proposals/authoring/shared";

const { ui } = Tenant.current();
const offchainProposals = ui.toggle("proposals/offchain")?.enabled;

const DraftFormClient = ({
  draftProposal,
  proposalTypes,
}: {
  draftProposal: DraftProposal;
  proposalTypes: FormattedProposalType[];
}) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [validProposalTypes, setValidProposalTypes] = useState<
    FormattedProposalType[]
  >(
    getValidProposalTypesForVotingType(
      proposalTypes,
      DraftVotingModuleType.BASIC
    )
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareParam = searchParams?.get("share");
  const { address } = useAccount();
  const { getAuthenticationData } = useProposalActionAuth();

  const methods = useForm<z.output<typeof DraftProposalSchema>>({
    resolver: zodResolver(DraftProposalSchema),
    mode: "onBlur",
    defaultValues: (parseProposalToForm(draftProposal) ||
      DEFAULT_FORM) as z.output<typeof DraftProposalSchema>,
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
  }, [votingModuleType, proposalTypes]);

  // Ensure proposalConfigType is set when returning from other stages
  useEffect(() => {
    const current = methods.getValues("proposalConfigType");
    if (!current && validProposalTypes.length > 0) {
      methods.setValue(
        "proposalConfigType",
        validProposalTypes[0].proposal_type_id.toString()
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
      const messagePayload = {
        action: "updateDraft",
        draftProposalId: draftProposal.id,
        creatorAddress: address,
        timestamp: new Date().toISOString(),
      };

      const auth = await getAuthenticationData(messagePayload);
      if (!auth) {
        setIsPending(false);
        toast("Authentication failed");
        return;
      }

      const res = await draftProposalAction({
        ...data,
        draftProposalId: draftProposal.id,
        creatorAddress: address,
        jwt: auth.jwt,
      });
      if (!res.ok) {
        setIsPending(false);
        toast(res.message);
        return;
      } else {
        invalidatePath(draftProposal.id);
        const nextId = draftProposal.uuid;
        router.push(buildDraftUrl(nextId, stageIndex + 1, shareParam));
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
                    label=""
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
                  options={validProposalTypes.map(
                    toAuthoringProposalTypeSelectOption
                  )}
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
                case DraftVotingModuleType.BASIC:
                  return <BasicProposalForm />;
                case DraftVotingModuleType.SOCIAL:
                  return <SocialProposalForm />;
                case DraftVotingModuleType.APPROVAL:
                  return <ApprovalProposalForm />;
                case DraftVotingModuleType.OPTIMISTIC:
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
