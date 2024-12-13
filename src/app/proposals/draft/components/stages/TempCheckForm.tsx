"use client";

import {
  GET_DRAFT_STAGES,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import { UpdatedButton } from "@/components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { z } from "zod";
import { onSubmitAction as tempCheckAction } from "../../actions/createTempCheck";
import { schema as tempCheckSchema } from "../../schemas/tempCheckSchema";
import { DraftProposal } from "../../types";
import FormCard from "../form/FormCard";
import TextInput from "../form/TextInput";
import DeleteDraftButton from "../DeleteDraftButton";
import BackButton from "../BackButton";
import { AnimatePresence, motion } from "framer-motion";

const TempCheckForm = ({
  draftProposal,
  rightColumn,
}: {
  draftProposal: DraftProposal;
  rightColumn: React.ReactElement;
}) => {
  const router = useRouter();
  const { address } = useAccount();
  const [isSkipPending, setIsSkipPending] = useState(false);
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const methods = useForm<z.output<typeof tempCheckSchema>>({
    resolver: zodResolver(tempCheckSchema),
    defaultValues: {
      temp_check_link: draftProposal.temp_check_link,
    },
  });
  const { control, handleSubmit } = methods;

  const stageIndex = getStageIndexForTenant("ADDING_TEMP_CHECK") as number;

  const onSubmitSkip = async (data: z.output<typeof tempCheckSchema>) => {
    setIsSkipPending(true);
    await sharedOnSubmit(data);
  };

  const onSubmit = async (data: z.output<typeof tempCheckSchema>) => {
    setIsSubmitPending(true);
    await sharedOnSubmit(data);
  };

  const sharedOnSubmit = async (data: z.output<typeof tempCheckSchema>) => {
    try {
      if (!address) {
        toast.error("No address connected");
        return;
      }
      const res = await tempCheckAction({
        ...data,
        draftProposalId: draftProposal.id,
        creatorAddress: address,
      });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.push(
        `/proposals/draft/${draftProposal.id}?stage=${stageIndex + 1}`
      );
    } catch (e: any) {
      console.error("An error was uncaught in `tempCheckAction`: ", e);
      toast.error(e.message);
    }
  };

  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;

  return (
    <FormProvider {...methods}>
      <form>
        <main className="max-w-screen-xl mx-auto mt-10">
          <div className="flex flex-row items-center justify-between bg-neutral">
            <div className="flex flex-row items-center space-x-4">
              {stageIndex > 0 && (
                <BackButton
                  draftProposalId={draftProposal.id}
                  index={stageIndex}
                />
              )}
              <h1 className="font-semibold text-primary text-2xl m-0">
                Temp Check
              </h1>
              <span className="bg-tertiary/5 text-tertiary rounded-full px-2 py-1 text-sm">
                {/* stageObject.order + 1 is becuase order is zero indexed */}
                Step {stageIndex + 1}/{DRAFT_STAGES_FOR_TENANT.length}
              </span>
            </div>
            <div className="flex flex-row items-center space-x-4">
              <DeleteDraftButton proposalId={draftProposal.id} />
              <UpdatedButton
                type="secondary"
                isLoading={isSkipPending}
                onClick={handleSubmit(onSubmitSkip)}
              >
                Skip
              </UpdatedButton>
              <UpdatedButton
                type="primary"
                isLoading={isSubmitPending}
                onClick={handleSubmit(onSubmit)}
              >
                Continue
              </UpdatedButton>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6 mt-6">
            <AnimatePresence mode="wait">
              <motion.section
                className="col-span-1 sm:col-span-2 order-last sm:order-first"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <FormCard>
                  <FormCard.Section>
                    <div className="w-full rounded-md h-[350px] block relative">
                      <Image
                        // TODO: do we want to make this something that is configurable by tenant?
                        // Or should we have a default for all tenants?
                        src="/images/ens_temp_check.png"
                        alt="Digital collage of sparkles and thumbs ups promoting caputuring a temp check."
                        fill={true}
                        className="object-cover rounded-md"
                      />
                    </div>
                    {/*
            TODO: is this copy the same for everyone who wants to do a temp check?
            Should this be something you configure at the tenant level?
           */}
                    <p className="mt-4 text-secondary">
                      We encourage you to go to Discourse to post a temp check
                      that helps gauge the community&apos;s interest. It&apos;s
                      not mandatory, but helps create alignment with the voter
                      base.
                    </p>
                  </FormCard.Section>
                  <FormCard.Section>
                    <div className="flex flex-row justify-between space-x-2">
                      <div className="flex-grow">
                        <TextInput
                          label="Link"
                          name="temp_check_link"
                          control={control}
                          //   TODO: still ENS branded -- make generalizable
                          placeholder="https://discuss.ens.domains/"
                        />
                      </div>
                    </div>
                  </FormCard.Section>
                </FormCard>
              </motion.section>
            </AnimatePresence>
            <section className="col-span-1">
              <div className="bg-wash border border-line rounded-2xl p-4">
                {rightColumn}
              </div>
            </section>
          </div>
        </main>
      </form>
    </FormProvider>
  );
};

export default TempCheckForm;
