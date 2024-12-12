"use client";

import { getStageIndexForTenant } from "@/app/proposals/draft/utils/stages";
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

const TempCheckForm = ({ draftProposal }: { draftProposal: DraftProposal }) => {
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

  return (
    <FormProvider {...methods}>
      <form>
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
              We encourage you to go to Discourse to post a temp check that
              helps gauge the community&apos;s interest. It&apos;s not
              mandatory, but helps create alignment with the voter base.
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
              <div className="space-x-2 self-start mt-[22px] flex items-center">
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
          </FormCard.Section>
        </FormCard>
      </form>
    </FormProvider>
  );
};

export default TempCheckForm;
