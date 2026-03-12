"use client";

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import OtherInfoFormSection from "./OtherInfoFormSection";
import { Button } from "@/components/ui/button";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useAccount, useSignMessage, useWalletClient } from "wagmi";
import { submitDelegateStatement } from "@/app/delegates/actions";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { createDelegateStatementMessage } from "@/lib/delegateStatement/messageFormat";
import TopStakeholdersFormSection from "@/components/DelegateStatement/TopStakeholdersFormSection";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useDelegate } from "@/hooks/useDelegate";
import { useDelegateStatementStore } from "@/stores/delegateStatement";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { isSafeWallet } from "@/lib/utils";
import {
  getDelegateStatementAuthMode,
  type DelegateStatementAuthPayload,
} from "@/lib/delegateStatement/auth";
import {
  isSafeOffchainMessageTrackingEnabled,
  SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE,
} from "@/lib/safeFeatures";
import { useEnsureSiweSession } from "@/hooks/useEnsureSiweSession";

export default function DelegateStatementForm({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const router = useRouter();
  const { ui } = Tenant.current();
  const { address, chain } = useAccount();
  const walletClient = useWalletClient();
  const messageSigner = useSignMessage();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const openDialog = useOpenDialog();
  const delegateStatementAuthMode = getDelegateStatementAuthMode();
  const { ensureSiweSession, isSigningIn: isSiweSigningIn } =
    useEnsureSiweSession({
      address,
      chainId: chain?.id,
      purpose: "delegate_statement",
    });

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

  const submitDelegateProfile = useCallback(
    async (
      connectedAddress: `0x${string}`,
      normalizedValues: DelegateStatementFormValues,
      auth: DelegateStatementAuthPayload
    ) => {
      const response = await submitDelegateStatement({
        address: connectedAddress,
        delegateStatement: normalizedValues,
        scwAddress,
        auth,
      }).catch((error) => {
        console.error(error);
        return null;
      });

      if (!response) {
        throw new Error(
          "There was an error submitting your delegate profile, please try again."
        );
      }

      setSaveSuccess(true);
      router.push(`/delegates/${connectedAddress}`);
    },
    [router, scwAddress, setSaveSuccess]
  );

  async function onSubmit(values: DelegateStatementFormValues) {
    /* agreeCodeConduct and agreeDaoPrinciples default values are !enabled so if it's not enabled for a tenant, it will be true, skipping the check below.
    If enabled, it will be false by default and the user will need to check the box. */
    if (!agreeCodeConduct || !agreeDaoPrinciples) {
      return;
    }

    const normalizedValues = {
      ...values,
      topIssues: values.topIssues.filter((issue) => issue.value !== ""),
    };

    try {
      setSubmissionError(null);
      const connectedAddress = address as `0x${string}`;
      const connectedChainId = chain?.id;

      if (!connectedAddress) {
        throw new Error("Wallet not connected.");
      }

      if (
        delegateStatementAuthMode === "signed_message" &&
        typeof connectedChainId !== "number"
      ) {
        throw new Error("Wallet chain unavailable.");
      }

      if (delegateStatementAuthMode === "siwe_jwt") {
        const jwt = await ensureSiweSession({
          onSafeAuthenticated: async (safeJwt) => {
            setSubmissionError(null);
            await submitDelegateProfile(connectedAddress, normalizedValues, {
              kind: "siwe_jwt",
              jwt: safeJwt,
            });
          },
          onSafeClosed: (reason) => {
            if (reason === "expired") {
              setSubmissionError(
                "The Safe sign-in flow expired. Please try again."
              );
              return;
            }

            setSubmissionError("Safe sign-in was cancelled or failed.");
          },
        });

        if (!jwt) {
          return;
        }

        await submitDelegateProfile(connectedAddress, normalizedValues, {
          kind: "siwe_jwt",
          jwt,
        });
        return;
      }

      if (!walletClient) {
        throw new Error("signer not available");
      }

      // User will only sign what they are seeing on the frontend
      const serializedBody = createDelegateStatementMessage(normalizedValues, {
        daoSlug: normalizedValues.daoSlug,
        discord: normalizedValues.discord,
        email: normalizedValues.email,
        twitter: normalizedValues.twitter,
        warpcast: normalizedValues.warpcast,
        topIssues: normalizedValues.topIssues,
        topStakeholders: normalizedValues.topStakeholders,
        scwAddress,
        notificationPreferences: normalizedValues.notificationPreferences,
      });

      const safeWallet = await isSafeWallet(
        connectedAddress,
        connectedChainId!
      );

      if (safeWallet) {
        if (!isSafeOffchainMessageTrackingEnabled()) {
          setSubmissionError(SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE);
          return;
        }

        const submitApprovedDelegateProfile = async (
          signature: `0x${string}`
        ) => {
          await submitDelegateProfile(connectedAddress, normalizedValues, {
            kind: "signed_message",
            signature,
            chainId: connectedChainId!,
          });
        };

        openDialog({
          type: "SAFE_OFFCHAIN_SIGNING",
          className: "sm:w-[42rem]",
          disableDismiss: true,
          params: {
            safeAddress: connectedAddress,
            chainId: connectedChainId,
            purpose: "delegate_statement",
            signingKind: "raw_message",
            message: serializedBody,
            signMessage: messageSigner.signMessageAsync,
            onCompleted: submitApprovedDelegateProfile,
            onClosed: (reason) => {
              if (reason === "expired") {
                setSubmissionError(
                  "The Safe signing flow expired. Please try again."
                );
                return;
              }

              setSubmissionError("Signature failed, please try again");
            },
          },
        });
        return;
      }

      const signature = await messageSigner.signMessageAsync({
        message: serializedBody,
      });

      if (!signature) {
        setSubmissionError("Signature failed, please try again");
        return;
      }

      await submitDelegateProfile(connectedAddress, normalizedValues, {
        kind: "signed_message",
        signature,
        chainId: connectedChainId!,
      });
    } catch (error) {
      console.error(error);
      setSubmissionError(
        error instanceof Error
          ? error.message
          : delegateStatementAuthMode === "siwe_jwt"
            ? "Failed to authenticate. Please try again."
            : "Signature failed, please try again."
      );
      return;
    }
  }

  const requiresWalletClient = delegateStatementAuthMode === "signed_message";
  const canSubmit =
    !!address &&
    (!requiresWalletClient || !!walletClient) &&
    !(delegateStatementAuthMode === "siwe_jwt" && isSiweSigningIn) &&
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
        <div className="flex flex-col bg-neutral border rounded-xl border-line shadow-newDefault">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DelegateStatementFormSection form={form} />
              {hasTopIssues && <TopIssuesFormSection form={form} />}
              {hasStakeholders && <TopStakeholdersFormSection form={form} />}
              <OtherInfoFormSection form={form} />

              <div className="flex flex-col sm:flex-row justify-end sm:justify-between items-stretch sm:items-center gap-4 py-8 px-6 flex-wrap">
                <span className="text-sm text-primary">
                  Tip: you can always come back and edit your profile at any
                  time.
                </span>

                <Button
                  variant="elevatedOutline"
                  className="py-3 px-4 text-primary"
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
