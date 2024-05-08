"use client";

import { z } from "zod";
import Tenant from "@/lib/tenant/tenant";
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import FormCard from "../form/FormCard";
import FormItem from "../form/FormItem";
import TextInput from "../form/TextInput";
import { UpdatedButton } from "@/components/Button";
import { schema as tempCheckSchema } from "../../schemas/tempCheckSchema";
import { onSubmitAction as tempCheckAction } from "../../actions/createTempCheck";

const TempCheckForm = () => {
  const { slug: dao_slug } = Tenant.current();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.output<typeof tempCheckSchema>>({
    resolver: zodResolver(tempCheckSchema),
  });

  const onSubmit = async (data: z.output<typeof tempCheckSchema>) => {
    const res = await tempCheckAction({
      ...data,
      dao_slug: dao_slug.toLowerCase(),
    });
    console.log(res);

    redirect(`/proposals/draft?stage=1`);
  };

  return (
    <form
      //   action={async (formData: FormData) => {
      //     await tempCheckAction(formData);
      //     // this should probably be order in the tenent list + 1
      //     redirect(`/proposals/draft?stage=1`);
      //   }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormCard>
        <FormCard.Section>
          <span className="w-full rounded-md h-[300px] bg-agora-stone-50 border border-agora-stone-100 block"></span>
          <p className="mt-4 text-stone-700">
            We encourage you to go to Discourse to post a temp check that helps
            gauge the community's interest. It's not mandatory, but helps create
            alignment with the voter base.
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
            <div className="space-x-2 self-end">
              <UpdatedButton type="secondary" isSubmit={true}>
                Skip
              </UpdatedButton>
              <UpdatedButton type="primary" isSubmit={true}>
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
