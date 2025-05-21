"use client";

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import SocialFormSection from "./SocialFormSection";
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
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useSignInWithSafeMessage } from "@/hooks/useSignInWithSafeMessage";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DraftStatementDetails } from "@/components/Delegates/DelegateStatement/DelegateDraftStatement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PublicIcon } from "@/icons/PublicIcon";
import { LockIcon } from "@/icons/lockIcon";

export default function DelegateDetailsForm({
  form,
  delegate,
  canEdit,
}: {
  form: UseFormReturn<DelegateDetailsFormValues>;
  delegate: Delegate | undefined;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { selectedWalletAddress: address, isSelectedPrimaryAddress } =
    useSelectedWallet();
  const walletClient = useWalletClient();
  const messageSigner = useSignMessage();
  const safeMessageSigner = useSignInWithSafeMessage();
  const openDialog = useOpenDialog();
  const { data: scwAddress } = useSmartAccountAddress({ owner: address });
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  async function onSubmit(values: DelegateDetailsFormValues) {
    try {
      if (!walletClient && isSelectedPrimaryAddress) {
        // Check walletClient only if EOA is expected
        throw new Error("Wallet client not available for EOA signing");
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
          (originalDelegateStatement?.payload as any)?.agreeCodeConduct ?? true,
        agreeDaoPrinciples:
          (originalDelegateStatement?.payload as any)?.agreeDaoPrinciples ??
          true,
        delegateStatement:
          (originalDelegateStatement?.payload as any)?.delegateStatement ?? "",
        topIssues: (originalDelegateStatement?.payload as any)?.topIssues ?? [],
        topStakeholders:
          (originalDelegateStatement?.payload as any)?.topStakeholders ?? [],
        scwAddress: scwAddress, // Use current scwAddress from hook
      };

      const serializedBody = JSON.stringify(body, undefined, "\t");
      let signature: string | null | undefined = null;
      let messageHash: string | undefined = undefined;

      if (isSelectedPrimaryAddress) {
        signature = await messageSigner
          .signMessageAsync({
            message: serializedBody,
          })
          .catch((error) => {
            console.error("EOA Signature error:", error);
            return null;
          });
      } else {
        const data = await safeMessageSigner
          .signMessage({
            message: serializedBody,
            safeAddress: address as `0x${string}`,
          })
          .catch((error) => {
            console.error("Safe Signature error:", error);
            return null;
          });

        if (!data) {
          setSubmissionError("Signature failed, please try again");
          return;
        }
        const { signature: safeSignature, safeMessageHash } = data;
        signature = safeSignature.data;
        messageHash = safeMessageHash;
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
        scwAddress: scwAddress, // Pass current scwAddress
        message_hash: messageHash || "",
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

  async function checkSafeConfirmation(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    const submissionHandler = form.handleSubmit(onSubmit);

    if (!isSelectedPrimaryAddress) {
      openDialog({
        type: "SAFE_SIGN_CONFIRMATION",
        params: {
          onSubmit: submissionHandler,
        },
      });
    } else {
      await submissionHandler();
    }
  }

  function handleCancel() {
    router.push(`/delegates/${address}`);
  }

  const renderForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={checkSafeConfirmation} className="text-left">
          <div className="flex flex-col bg-neutral rounded-xl border border-line mb-4">
            <div className="self-stretch px-6 py-3.5 bg-brandPrimary/10 border-b border-line inline-flex justify-start items-center gap-1.5 rounded-tl-xl rounded-tr-xl">
              <PublicIcon className="stroke-brandPrimary block md:hidden lg:block" />
              <div className="flex justify-start items-start gap-1 justify-center text-xs leading-none">
                <div className="font-semibold block md:hidden lg:block">
                  Public:
                </div>
                <div className="font-medium">
                  This information is publicly visible on your delegate profile
                  but not on-chain.
                </div>
              </div>
            </div>
            <SocialFormSection form={form as any} />
          </div>
          <div className="flex flex-col bg-neutral rounded-xl border border-line mb-4">
            <div className="self-stretch px-6 py-3.5 bg-brandPrimary/10 border-b border-line inline-flex justify-start items-center gap-1.5 rounded-tl-xl rounded-tr-xl">
              <LockIcon className="stroke-brandPrimary block md:hidden lg:block" />
              <div className="flex justify-start items-start gap-1 justify-center text-xs leading-none">
                <div className="font-semibold block md:hidden lg:block">
                  Private:
                </div>
                <div className="font-medium">
                  Your email is private and will never be shared publicly.
                </div>
              </div>
            </div>
            <DelegateEmailDetails form={form as any} />
          </div>
          <div className="flex flex-col bg-neutral rounded-xl border border-line">
            <div className="flex flex-col sm:flex-row justify-end sm:justify-between items-stretch sm:items-center gap-4 p-6 flex-wrap">
              <Button
                variant="outline"
                className="flex-1 py-3 px-4 text-primary rounded-full text-base h-12"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                variant="brand"
                className="flex-1 py-3 px-4 text-neutral text-base h-12"
                type="submit"
                disabled={!canEdit} // Disable button if not editable
              >
                Save
              </Button>
              {submissionError && (
                <span className="text-red-700 text-sm">{submissionError}</span>
              )}
            </div>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start lg:gap-16 md:gap-8 justify-between w-full max-w-full">
      {delegate && (
        <div className="flex flex-col static md:sticky top-16 shrink-0 w-full lg:max-w-[350px] md:max-w-[300px]">
          <DelegateCard delegate={delegate} isEditMode />
        </div>
      )}
      <div className="flex flex-col w-full mt-6 md:mt-0 gap-6">
        {!isSelectedPrimaryAddress && (
          <DraftStatementDetails delegateStatement={delegate?.statement} />
        )}
        <div className="flex flex-col rounded-xl">
          {canEdit ? (
            renderForm()
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-col w-full">
                  {renderForm()}
                </TooltipTrigger>
                <TooltipContent className="text-primary text-sm max-w-[200px]">
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
