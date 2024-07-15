"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import FormCard from "../form/FormCard";
import FormItem from "../form/FormItem";
import TextInput from "../form/TextInput";
import { UpdatedButton } from "@/components/Button";
import { schema as tempCheckSchema } from "../../schemas/tempCheckSchema";
import { onSubmitAction as tempCheckAction } from "../../actions/createTempCheck";
import { ProposalDraft } from "@prisma/client";
import { useAccount } from "wagmi";
import Image from "next/image";

const TempCheckForm = ({ draftProposal }: { draftProposal: ProposalDraft }) => {
  const router = useRouter();
  const { address } = useAccount();
  const [isSkipPending, setIsSkipPending] = useState(false);
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.output<typeof tempCheckSchema>>({
    resolver: zodResolver(tempCheckSchema),
    defaultValues: {
      temp_check_link: draftProposal.temp_check_link,
    },
  });

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
        throw new Error("No address connected");
      }

      const res = await tempCheckAction({
        ...data,
        draftProposalId: draftProposal.id,
        creatorAddress: address,
      });
      router.push(`/proposals/draft/${draftProposal.id}?stage=1`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form>
      <FormCard>
        <FormCard.Section>
          <div className="w-full rounded-md h-[350px] block relative">
            <Image
              src="/images/ens_temp_check.png"
              alt="Temp Check"
              fill={true}
              className="object-cover rounded-md"
            />
          </div>
          <p className="mt-4 text-secondary">
            We encourage you to go to Discourse to post a temp check that helps
            gauge the community&apos;s interest. It&apos;s not mandatory, but
            helps create alignment with the voter base.
          </p>
        </FormCard.Section>
        <FormCard.Section>
          <div className="flex flex-row justify-between space-x-2">
            <div className="flex-grow">
              <FormItem label="Link" required={false} htmlFor="tempcheck_link">
                <TextInput
                  name="temp_check_link"
                  register={register}
                  placeholder="https://discuss.ens.domains/"
                  errorMessage={errors.temp_check_link?.message}
                />
              </FormItem>
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
  );
};

export default TempCheckForm;
