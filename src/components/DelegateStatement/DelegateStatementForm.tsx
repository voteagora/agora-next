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
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";
import { useGetDelegateDraftStatement } from "@/hooks/useGetDelegateDraftStatement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function DelegateStatementForm({
  form,
  canEdit = true,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
  canEdit: boolean;
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
  const openDialog = useOpenDialog();
  const { isSelectedPrimaryAddress } = useSelectedWallet();
  const { refetch } = useGetDelegateDraftStatement(address);
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
    let messageHash;

    if (isSelectedPrimaryAddress) {
      signature = await messageSigner
        .signMessageAsync({
          message: serializedBody,
        })
        .catch((error) => console.error(error));
    } else {
      // Use Safe wallet signing for non-primary addresses
      const data = await safeMessageSigner
        .signMessage({
          message: serializedBody,
          safeAddress: address as `0x${string}`,
        })
        .catch((error) => console.error(error));
      if (!data) {
        setSubmissionError("Signature failed, please try again");
        return;
      }
      const { signature: safeSignature, safeMessageHash } = data;
      signature = safeSignature?.data;
      messageHash = safeMessageHash ?? undefined;
    }

    if (!signature) {
      setSubmissionError("Signature failed, please try again");
      return;
    }

    const response = await submitDelegateStatement({
      address: address as `0x${string}`,
      delegateStatement: body,
      signature: signature as `0x${string}`,
      message: serializedBody,
      scwAddress,
      message_hash: messageHash || "",
    }).catch((error) => {
      console.error("Error submitting delegate statement:", error);
      return null;
    });

    if (!response) {
      setSubmissionError(
        "There was an error submitting your form, please try again"
      );
      return;
    }

    if (isSelectedPrimaryAddress) {
      setSaveSuccess(true);
    }

    refetch();
    router.push(`/delegates/${address}`);
  }

  const checkSafeConfirmation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const submissionHandler = form.handleSubmit(onSubmit);

    if (!isSelectedPrimaryAddress) {
      openDialog({
        type: "SAFE_SIGN_CONFIRMATION",
        params: {
          onSubmit: submissionHandler,
        },
        className: "sm:w-[512px]",
      });
    } else {
      await submissionHandler();
    }
  };

  const canSubmit =
    !!walletClient &&
    !form.formState.isSubmitting &&
    !!form.formState.isValid &&
    !!agreeCodeConduct &&
    !!agreeDaoPrinciples &&
    canEdit;

  const renderForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={checkSafeConfirmation} className="w-full">
          <DelegateStatementFormSection form={form} />
          {hasTopIssues && <TopIssuesFormSection form={form} />}
          {hasStakeholders && <TopStakeholdersFormSection form={form} />}
          <div className="p-6 ">
            {requireCodeOfConduct && (
              <DelegateStatementBoolSelector form={form} canEdit={canEdit} />
            )}
            {requireDaoPrinciples && (
              <DelegateStatementDaoPrinciplesSelector
                form={form}
                canEdit={canEdit}
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end sm:justify-between items-stretch sm:items-center gap-4 p-6 flex-wrap border-t border-line">
            <Button
              variant="outline"
              className="flex-1 py-3 px-4 text-primary rounded-full text-base h-12"
              type="button"
            >
              Cancel
            </Button>

            <Button
              variant="brand"
              className="flex-1 py-3 px-4 text-neutral text-base h-12"
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
              <span className="text-red-700 text-sm">{submissionError}</span>
            )}
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start lg:gap-16 md:gap-8 justify-between w-full max-w-full">
      {delegate && (
        <div className="flex flex-col static md:sticky top-16 shrink-0 w-full lg:max-w-[350px] md:max-w-[300px]">
          <DelegateCard delegate={delegate} isEditMode />
        </div>
      )}
      <div className="flex flex-col w-full mt-6 md:mt-0">
        {!isSelectedPrimaryAddress && (
          <DraftStatementDetails delegateStatement={delegate?.statement} />
        )}
        <div className="flex flex-col bg-neutral rounded-xl border border-line">
          {canEdit ? (
            renderForm()
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-col w-full items-center">
                  {renderForm()}
                </TooltipTrigger>
                <TooltipContent className="text-primary text-sm max-w-[300px]">
                  This content cannot be edited as it is pending approval from a
                  Safe Wallet. You can cancel this submission any time prior to
                  approvals.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
