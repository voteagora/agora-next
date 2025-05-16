"use client";

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import { Button } from "@/components/ui/button";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useSignMessage, useWalletClient } from "wagmi";
import { submitDelegateStatement } from "@/app/delegates/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import TopStakeholdersFormSection from "@/components/DelegateStatement/TopStakeholdersFormSection";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useDelegate } from "@/hooks/useDelegate";
import { useDelegateStatementStore } from "@/stores/delegateStatement";
import DelegateStatementBoolSelector, {
  DelegateStatementDaoPrinciplesSelector,
} from "./DelegateStatementBoolSelector";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useSignInWithSafeMessage } from "@/hooks/useSignInWithSafeMessage";
import { DraftStatementDetails } from "../Delegates/DelegateStatement/DelegateDraftStatement";
import { stageStatus } from "@/app/lib/sharedEnums";

export default function DelegateStatementForm({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const router = useRouter();
  const { ui } = Tenant.current();
  const { selectedWalletAddress: address } = useSelectedWallet();
  const walletClient = useWalletClient();
  const messageSigner = useSignMessage();
  const safeMessageSigner = useSignInWithSafeMessage();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const requireCodeOfConduct = ui.toggle("delegates/code-of-conduct")?.enabled;
  const requireDaoPrinciples = ui.toggle("delegates/dao-principles")?.enabled;

  const { isSelectedPrimaryAddress } = useSelectedWallet();

  const { data: scwAddress } = useSmartAccountAddress({ owner: address });
  const { data: delegate } = useDelegate({ address });

  const hasTopIssues = Boolean(
    ui.governanceIssues && ui.governanceIssues.length > 0
  );
  const hasStakeholders = Boolean(
    ui.governanceStakeholders && ui.governanceStakeholders.length > 0
  );

  const agreeCodeConduct = useWatch({
    control: form.control,
    name: "agreeCodeConduct",
  });

  const agreeDaoPrinciples = useWatch({
    control: form.control,
    name: "agreeDaoPrinciples",
  });

  const setSaveSuccess = useDelegateStatementStore(
    (state) => state.setSaveSuccess
  );

  async function onSubmit(values: DelegateStatementFormValues) {
    if (!agreeCodeConduct && !agreeDaoPrinciples) {
      return;
    }
    if (!walletClient) {
      throw new Error("signer not available");
    }

    values.topIssues = values.topIssues.filter((issue) => issue.value !== "");
    const originalDelegateStatement = delegate?.statement;
    const { daoSlug, delegateStatement, topIssues, topStakeholders } = values;

    const body = {
      agreeCodeConduct: values.agreeCodeConduct,
      agreeDaoPrinciples: values.agreeDaoPrinciples,
      daoSlug,
      delegateStatement,
      topIssues,
      topStakeholders,
      scwAddress,
      discord: originalDelegateStatement?.discord || "",
      email: originalDelegateStatement?.email || "",
      twitter: originalDelegateStatement?.twitter || "",
      warpcast: originalDelegateStatement?.warpcast || "",
      notificationPreferences:
        originalDelegateStatement?.notification_preferences || {
          wants_proposal_created_email: "prompt",
          wants_proposal_ending_soon_email: "prompt",
        },
    };

    const serializedBody = JSON.stringify(body, undefined, "\t");
    let signature;
    if (isSelectedPrimaryAddress) {
      signature = await messageSigner
        .signMessageAsync({
          message: serializedBody,
        })
        .catch((error) => console.error(error));

      if (!signature) {
        setSubmissionError("Signature failed, please try again");
        return;
      }
    } else {
      // Use Safe wallet signing for non-primary addresses
      signature = await safeMessageSigner
        .signMessage({
          message: serializedBody,
          safeAddress: address as `0x${string}`,
        })
        .catch((error) => console.error(error));

      if (!signature) {
        setSubmissionError("Safe signature failed, please try again");
        return;
      }
    }

    const response = await submitDelegateStatement({
      address: address as `0x${string}`,
      delegateStatement: body,
      signature,
      message: serializedBody,
      scwAddress,
      stage: stageStatus.PUBLISHED,
    }).catch((error) => console.error(error));

    if (!response) {
      setSubmissionError(
        "There was an error submitting your form, please try again"
      );
      return;
    }

    setSaveSuccess(true);
    router.push(`/delegates/${address}`);
  }

  const canSubmit =
    !!walletClient &&
    !form.formState.isSubmitting &&
    !!form.formState.isValid &&
    !!agreeCodeConduct &&
    !!agreeDaoPrinciples;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start lg:gap-16 md:gap-8 justify-between mt-12 w-full max-w-full">
      {delegate && (
        <div className="flex flex-col static md:sticky top-16 shrink-0 w-full lg:max-w-[350px] md:max-w-[300px]">
          <DelegateCard delegate={delegate} isEditMode />
        </div>
      )}
      <div className="flex flex-col w-full mt-6 lg:mt-0">
        {!isSelectedPrimaryAddress && (
          <DraftStatementDetails delegateStatement={delegate?.statement} />
        )}
        <div className="flex flex-col bg-neutral rounded-xl shadow-newDefault">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DelegateStatementFormSection form={form} />
              {hasTopIssues && <TopIssuesFormSection form={form} />}
              {hasStakeholders && <TopStakeholdersFormSection form={form} />}
              <div className="py-8 px-6 ">
                {requireCodeOfConduct && (
                  <DelegateStatementBoolSelector form={form} />
                )}
                {requireDaoPrinciples && (
                  <DelegateStatementDaoPrinciplesSelector form={form} />
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end sm:justify-between items-stretch sm:items-center gap-4 py-8 px-6 flex-wrap border-t border-line">
                <Button
                  variant="outline"
                  className="flex-1 py-3 px-4 text-primary rounded-full text-base"
                  type="button"
                >
                  Cancel
                </Button>

                <Button
                  variant="brand"
                  className="flex-1 py-3 px-4 text-neutral text-base"
                  disabled={!canSubmit}
                  type="submit"
                >
                  Save
                </Button>
                {form.formState.isSubmitted && !agreeCodeConduct && (
                  <span className="text-red-700 text-sm">
                    You must agree with the code of conduct to continue
                  </span>
                )}
                {form.formState.isSubmitted && !agreeDaoPrinciples && (
                  <span className="text-red-700 text-sm">
                    You must agree with the DAO principles to continue
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
        </div>
      </div>
    </div>
  );
}
