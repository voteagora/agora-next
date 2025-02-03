"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  DEFAULT_FORM,
  parseToForm,
  schema as requestSponsorshipSchema,
} from "../../schemas/requestSponsorshipSchema";
import {
  BasicProposal,
  DraftProposal,
  PLMConfig,
  ProposalType,
} from "../../types";
import { useManager } from "@/hooks/useManager";
import DeleteDraftButton from "../DeleteDraftButton";
import BackButton from "../BackButton";
import { GET_DRAFT_STAGES, getStageIndexForTenant } from "../../utils/stages";
import { UpdatedButton } from "@/components/Button";
import FormCard from "../form/FormCard";
import ProposalTransactionDisplay from "@/components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";
import { formatFullDate } from "@/lib/utils";
import MarkdownPreview from "@uiw/react-markdown-preview";
import ProposalRequirements from "../ProposalRequirements";
import Tenant from "@/lib/tenant/tenant";
import { useCanSponsor } from "../../hooks/useCanSponsor";
import { ProposalGatingType } from "../../types";
import { useAccount } from "wagmi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SwitchInput from "../form/SwitchInput";
import { onSubmitAction as requestSponsorshipAction } from "../../actions/requestSponsorship";
import { invalidatePath } from "../../actions/revalidatePath";
import { ProposalStage } from "@prisma/client";
import { isAddress } from "viem";
import SponsorInput from "../SponsorInput";
import SponsorActions from "../../../sponsor/components/SponsorActions";
import { useDirection } from "../../[id]/components/AnimationDirectionProvider";
import { motion } from "framer-motion";

enum Visibility {
  PUBLIC = "Public",
  PRIVATE = "Private",
}

const PreText = ({ text }: { text: string }) => {
  return (
    <span className="bg-[#FAFAF2] border-[#ECE3CA] text-[#B16B19] inline-block px-1 py-0.5 rounded">
      {text}
    </span>
  );
};

const renderProposalDescription = (proposal: DraftProposal) => {
  switch (proposal.voting_module_type) {
    case ProposalType.BASIC:
      return (
        <p className="text-secondary mt-2">
          This is a <PreText text="basic" /> proposal.
        </p>
      );
    case ProposalType.APPROVAL:
      return (
        <p className="text-secondary mt-2">
          This is an <PreText text="approval" /> proposal. The maximum number of
          tokens that can be transferred from all the options in this proposal
          is <PreText text={proposal.budget.toString()} />. The number of
          options each voter may select is{" "}
          <PreText text={proposal.max_options.toString()} />.{" "}
          {proposal.criteria === "Threshold" &&
            `All options with more than ${proposal.threshold} votes will be considered approved.`}
          {proposal.criteria === "Top choices" &&
            `The top ${proposal.threshold} choices will be considered approved.`}
        </p>
      );

    case ProposalType.SOCIAL:
      return (
        <p className="text-secondary mt-2">
          This is a <PreText text="social" /> proposal. Voters will vote on
          snapshot.
        </p>
      );

    case ProposalType.OPTIMISTIC:
      return (
        <p className="text-secondary mt-2">
          This is an <PreText text="optimistic" /> proposal
        </p>
      );

    default:
      return null;
  }
};

const SubmitForm = ({
  draftProposal,
  rightColumn,
}: {
  draftProposal: DraftProposal;
  rightColumn: React.ReactNode;
}) => {
  const { direction } = useDirection();
  const router = useRouter();
  const { ui } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");
  const proposalLifecycleConfig = plmToggle?.config as PLMConfig;
  const gatingType = proposalLifecycleConfig?.gatingType;
  const tenantSupportsPublicDrafts = proposalLifecycleConfig?.public;
  const methods = useForm<
    z.output<typeof requestSponsorshipSchema> & {
      visibility: Visibility;
    }
  >({
    resolver: zodResolver(requestSponsorshipSchema),
    defaultValues: {
      ...(parseToForm(draftProposal) || DEFAULT_FORM),
      visibility: draftProposal.is_public
        ? Visibility.PUBLIC
        : Visibility.PRIVATE,
    },
  });

  const { address } = useAccount();
  const { data: manager } = useManager();
  const { data: canAddressSponsor } = useCanSponsor(address as `0x${string}`);

  const stageIndex = getStageIndexForTenant("AWAITING_SUBMISSION") as number;
  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;

  const [isPending, setIsPending] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "sponsors",
  });

  const formValid = methods.formState.isValid;
  const visibility = methods.watch("visibility");
  const sponsors = methods.watch("sponsors");

  const { data: canUserSponsor } = useCanSponsor(address as `0x${string}`);

  return (
    <FormProvider {...methods}>
      <form>
        <main className="max-w-screen-xl mx-auto mt-12">
          <div className="flex flex-row items-center justify-between bg-neutral">
            <div className="flex flex-row items-center space-x-4">
              {stageIndex > 0 && (
                <BackButton
                  draftProposalId={draftProposal.id}
                  index={stageIndex}
                />
              )}
              <h1 className="font-bold text-primary text-2xl m-0">
                Submit for review
              </h1>
              <span className="bg-tertiary/5 text-tertiary rounded-full px-2 py-1 text-sm">
                {/* stageObject.order + 1 is becuase order is zero indexed */}
                Step {stageIndex + 1}/{DRAFT_STAGES_FOR_TENANT.length}
              </span>
            </div>
            <div className="flex flex-row items-center space-x-4">
              <DeleteDraftButton proposalId={draftProposal.id} />
              {canUserSponsor && (
                <SponsorActions draftProposal={draftProposal} />
              )}
              <UpdatedButton
                fullWidth={true}
                isSubmit={false}
                isLoading={isPending}
                type={formValid ? "primary" : "disabled"}
                className="whitespace-nowrap min-w-[184px]"
                onClick={async () => {
                  if (formValid) {
                    setIsPending(true);
                    const res = await requestSponsorshipAction({
                      draftProposalId: draftProposal.id,
                      is_public: visibility === Visibility.PUBLIC,
                      sponsors: sponsors.filter(
                        (sponsor: { address: `0x${string}` }) =>
                          isAddress(sponsor.address)
                      ),
                    });
                    if (res.ok) {
                      invalidatePath(draftProposal.id);
                      router.push(`/proposals/sponsor/${draftProposal.id}`);
                    } else {
                      console.error(res.message);
                    }
                    setIsPending(false);
                  }
                }}
              >
                {draftProposal.stage === ProposalStage.AWAITING_SPONSORSHIP
                  ? "Update draft"
                  : "Create draft"}
              </UpdatedButton>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6 mt-6">
            <motion.section
              key="draftForm"
              className="col-span-1 sm:col-span-2 order-last sm:order-first"
              initial={{
                opacity: 0,
                x: direction === "prev" ? -50 : 50,
                filter: "blur(5px)",
              }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                x: direction === "prev" ? 50 : -50,
                filter: "blur(5px)",
              }}
            >
              <FormCard>
                <FormCard.Section>
                  <h2 className="font-semibold text-primary text-lg">
                    {draftProposal.title}
                  </h2>
                  {renderProposalDescription(draftProposal)}
                  <div className="mt-6">
                    {draftProposal.voting_module_type ===
                      ProposalType.BASIC && (
                      <ProposalTransactionDisplay
                        descriptions={(
                          draftProposal as BasicProposal
                        ).transactions.map((t) => t.description)}
                        targets={(
                          draftProposal as BasicProposal
                        ).transactions.map((t) => t.target)}
                        calldatas={
                          (draftProposal as BasicProposal).transactions.map(
                            (t) => t.calldata
                          ) as `0x${string}`[]
                        }
                        values={(
                          draftProposal as BasicProposal
                        ).transactions.map((t) => t.value)}
                        simulationDetails={{
                          id: (draftProposal as BasicProposal).transactions[0]
                            ?.simulation_id,
                          state: (draftProposal as BasicProposal)
                            .transactions[0]?.simulation_state,
                        }}
                      />
                    )}
                  </div>
                  {draftProposal.voting_module_type === ProposalType.SOCIAL && (
                    <div>
                      <h3 className="font-semibold mt-6">Voting strategy</h3>
                      <p className="text-secondary mt-2">
                        {draftProposal.proposal_social_type}
                      </p>
                      {draftProposal.start_date_social && (
                        <>
                          <h3 className="font-semibold mt-6">Voting start</h3>
                          <p className="text-secondary mt-2">
                            {formatFullDate(draftProposal.start_date_social)}
                          </p>
                        </>
                      )}
                      {draftProposal.end_date_social && (
                        <>
                          <h3 className="font-semibold mt-6">Voting end</h3>
                          <p className="text-secondary mt-2">
                            {formatFullDate(draftProposal.end_date_social)}
                          </p>
                        </>
                      )}
                      <h3 className="font-semibold mt-6 mb-2">
                        Voting options
                      </h3>
                      {draftProposal.social_options.map((option, index) => (
                        <p className="text-secondary" key={`draft-${index}`}>
                          {option.text}
                        </p>
                      ))}
                    </div>
                  )}
                  <h3 className="font-semibold mt-6">Description</h3>
                  <div className="mt-2 p-4 bg-wash border border-line rounded-lg">
                    <MarkdownPreview
                      source={draftProposal.abstract}
                      className={`h-full py-3 px-4 rounded-t-lg max-w-full bg-transparent prose`}
                      style={{
                        backgroundColor: "transparent",
                      }}
                      wrapperElement={{
                        "data-color-mode": "light",
                      }}
                    />
                  </div>
                </FormCard.Section>
                <FormCard.Section className="z-0">
                  <>
                    <h3 className="font-semibold">Requirements</h3>
                    {!canAddressSponsor && (
                      <p className="text-agora-stone-700 mt-2">
                        You do not meet the requirement to submit this proposal.
                        However, you can ask someone who does meet the
                        requirement to sponsor this proposal on your behalf. You
                        can make this proposal private and send it to a select
                        few people, or you can make it public for anyone in the
                        community to sponsor.
                      </p>
                    )}
                    <div className="mt-6">
                      {(gatingType === ProposalGatingType.MANAGER ||
                        gatingType === ProposalGatingType.GOVERNOR_V1) && (
                        <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4">
                          <p className="flex-grow">Manager address</p>
                          <span className="text-secondary font-mono text-xs">
                            {manager?.toString()}
                          </span>
                        </div>
                      )}
                      <div className="mt-6">
                        <ProposalRequirements proposalDraft={draftProposal} />
                      </div>

                      <div className="mt-4">
                        {tenantSupportsPublicDrafts && (
                          <SwitchInput
                            control={methods.control}
                            label="Draft proposal visibility"
                            required={true}
                            options={Object.values(Visibility)}
                            name="visibility"
                          />
                        )}
                        {visibility === Visibility.PRIVATE && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {fields.map((_field, index) => (
                              <SponsorInput
                                key={`sponsor-${index}`}
                                index={index}
                                remove={remove}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                append({ address: "" as `0x${string}` })
                              }
                              className="bg-primary text-neutral col-span-2 border-0 rounded-lg p-2 font-semibold"
                            >
                              Add sponsor
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                </FormCard.Section>
              </FormCard>
            </motion.section>
            <section className="col-span-1">{rightColumn}</section>
          </div>
        </main>
      </form>
    </FormProvider>
  );
};

export default SubmitForm;
