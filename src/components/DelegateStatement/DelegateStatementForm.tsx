"use client";

import { VStack } from "@/components/Layout/Stack";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import OtherInfoFormSection from "./OtherInfoFormSection";
import { Button } from "@/components/ui/button";
import { useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useAccount, useWalletClient, useSignMessage } from "wagmi";
import { Delegate } from "@/app/api/common/delegates/delegate";
import {
  fetchDelegate,
  submitDelegateStatement,
} from "@/app/delegates/actions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";

const cleanTopIssues = (
  issues: {
    value: string;
    type: string;
  }[]
) => {
  return issues.filter((issue) => issue.value !== "");
};

export default function DelegateStatementForm({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const router = useRouter();
  const { address } = useAccount();
  const walletClient = useWalletClient();
  const messageSigner = useSignMessage();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [delegate, setDelegate] = useState<Delegate | null>(null);

  const agreeCodeConduct = useWatch({
    control: form.control,
    name: "agreeCodeConduct",
  });

  useEffect(() => {
    async function _getDelegate() {
      const _delegate = await fetchDelegate(address as string);
      setDelegate(_delegate);
    }
    if (address) {
      _getDelegate();
    }
  }, [address]);

  async function onSubmit(values: DelegateStatementFormValues) {
    if (!agreeCodeConduct) {
      return;
    }
    if (!walletClient) {
      throw new Error("signer not available");
    }
    values.topIssues = cleanTopIssues(values.topIssues);
    const { daoSlug, discord, delegateStatement, email, twitter, topIssues } =
      values;

    // User will only sign what he is seeing on the frontend
    const body = {
      agreeCodeConduct: values.agreeCodeConduct,
      daoSlug,
      discord,
      delegateStatement,
      email,
      twitter,
      topIssues,
    };

    const serializedBody = JSON.stringify(body, undefined, "\t");
    const signature = await messageSigner
      .signMessageAsync({
        message: serializedBody,
      })
      .catch((error) => console.error(error));

    if (!signature) {
      setSubmissionError("Signature failed, please try again");
      return;
    }

    const response = await submitDelegateStatement({
      address: address as `0x${string}`,
      delegateStatement: values,
      signature,
      message: serializedBody,
    }).catch((error) => console.error(error));

    if (!response) {
      setSubmissionError(
        "There was an error submitting your form, please try again"
      );
      return;
    }

    router.push(`/delegates/${address}?dssave=true`);
  }

  const canSubmit =
    !!walletClient &&
    !form.formState.isSubmitting &&
    !!form.formState.isValid &&
    !!agreeCodeConduct;

  return (
    <div className="flex flex-col xl:flex-row-reverse items-center xl:items-start gap-16 justify-between mt-12 w-full max-w-full">
      {delegate && (
        <VStack className="static xl:sticky top-16 shrink-0 w-full xl:max-w-xs">
          <DelegateCard delegate={delegate} />
        </VStack>
      )}
      <VStack className="w-full">
        <VStack className="bg-white border rounded-xl border-gray-300 shadow-newDefault">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DelegateStatementFormSection form={form} />
              <TopIssuesFormSection form={form} />
              <OtherInfoFormSection form={form} />

              <div className="flex flex-col lg:flex-row justify-end lg:justify-between items-stretch lg:items-center gap-4 py-8 px-6 flex-wrap">
                <span className="text-sm text-gray-800">
                  Tip: you can always come back and edit your profile at any
                  time.
                </span>

                <Button
                  variant="elevatedOutline"
                  className="py-3 px-4"
                  disabled={!canSubmit}
                  type="submit"
                >
                  Submit delegate profile
                </Button>
                {form.formState.isSubmitted && !agreeCodeConduct && (
                  <span className="text-red-700 text-sm">
                    You must agree with the code of conduct to continue
                  </span>
                )}
                {submissionError && (
                  <span className="text-red-700 text-sm">
                    {submissionError}
                  </span>
                )}
              </div>
            </form>
          </Form>
        </VStack>
      </VStack>
    </div>
  );
}
