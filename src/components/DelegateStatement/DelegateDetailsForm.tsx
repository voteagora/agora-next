"use client";

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import OtherInfoFormSection from "./OtherInfoFormSection";
import { Button } from "@/components/ui/button";
import { type UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useSignMessage, useWalletClient } from "wagmi";
import { submitDelegateStatement } from "@/app/delegates/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type DelegateDetailsFormValues } from "./DelegateDetailsPage";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { DelegateEmailDetails } from "./DelegateEmailDetails";
import { stageStatus } from "@/app/lib/sharedEnums";

export default function DelegateDetailsForm({
  form,
  delegate,
}: {
  form: UseFormReturn<DelegateDetailsFormValues>;
  delegate: Delegate | undefined;
}) {
  const router = useRouter();
  const { selectedWalletAddress: address } = useSelectedWallet();
  const walletClient = useWalletClient();
  const messageSigner = useSignMessage();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  async function onSubmit(values: DelegateDetailsFormValues) {
    try {
      if (!walletClient) {
        throw new Error("signer not available");
      }

      const originalDelegateStatement = delegate?.statement;

      const {
        daoSlug,
        discord,
        email,
        twitter,
        warpcast,
        notificationPreferences,
      } = values;

      const body = {
        daoSlug,
        discord,
        email,
        twitter,
        warpcast,
        notificationPreferences,

        agreeCodeConduct:
          (originalDelegateStatement?.payload as any)?.agreeCodeConduct || true,
        agreeDaoPrinciples:
          (originalDelegateStatement?.payload as any)?.agreeDaoPrinciples ||
          true,
        delegateStatement:
          (originalDelegateStatement?.payload as any)?.delegateStatement || "",
        topIssues: (originalDelegateStatement?.payload as any)?.topIssues || [],
        topStakeholders:
          (originalDelegateStatement?.payload as any)?.topStakeholders || [],
        scwAddress: originalDelegateStatement?.scw_address || "",
      };

      const serializedBody = JSON.stringify(body, undefined, "\t");

      const signature = await messageSigner
        .signMessageAsync({
          message: serializedBody,
        })
        .catch((error) => {
          return null;
        });

      if (!signature) {
        setSubmissionError("Signature failed, please try again");
        return;
      }

      const response = await submitDelegateStatement({
        address: address as `0x${string}`,
        delegateStatement: body,
        signature,
        message: serializedBody,
        stage: stageStatus.PUBLISHED,
      }).catch((error) => {
        console.error("Error during submission:", error);
        return null;
      });

      if (!response) {
        console.error("API submission failed");
        setSubmissionError(
          "There was an error submitting your form, please try again"
        );
        return;
      }

      router.push(`/delegates/${address}`);
    } catch (error) {
      setSubmissionError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  function handleCancel() {
    router.push(`/delegates/${address}`);
  }

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start lg:gap-16 md:gap-8 justify-between mt-12 w-full max-w-full">
      {delegate && (
        <div className="flex flex-col static md:sticky top-16 shrink-0 w-full lg:max-w-[350px] md:max-w-[300px]">
          <DelegateCard delegate={delegate} isEditMode />
        </div>
      )}
      <div className="flex flex-col w-full mt-6 lg:mt-0 gap-6">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(form.getValues());
            }}
          >
            <div className="flex flex-col bg-neutral rounded-xl shadow-newDefault mb-4">
              <OtherInfoFormSection form={form as any} />
            </div>
            <div className="flex flex-col bg-neutral rounded-xl shadow-newDefault mb-4">
              <DelegateEmailDetails form={form as any} />
            </div>
            <div className="flex flex-col bg-neutral rounded-xl shadow-newDefault">
              <div className="flex flex-col sm:flex-row justify-end sm:justify-between items-stretch sm:items-center gap-4 py-8 px-6 flex-wrap">
                <Button
                  variant="outline"
                  className="flex-1 py-3 px-4 text-primary rounded-full text-base"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>

                <Button
                  variant="brand"
                  className="flex-1 py-3 px-4 text-neutral text-base"
                  type="submit"
                >
                  Save
                </Button>
                {submissionError && (
                  <span className="text-red-700 text-sm">
                    {submissionError}
                  </span>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
