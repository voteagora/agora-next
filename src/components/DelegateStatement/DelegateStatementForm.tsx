"use client";

import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import OtherInfoFormSection from "./OtherInfoFormSection";
import { Button } from "@/components/ui/button";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useAccount } from "wagmi";
import { submitDelegateStatement } from "@/app/delegates/actions";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import TopStakeholdersFormSection from "@/components/DelegateStatement/TopStakeholdersFormSection";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useDelegate } from "@/hooks/useDelegate";
import { useDelegateStatementStore } from "@/stores/delegateStatement";
import { type DelegateStatementAuthPayload } from "@/lib/delegateStatement/auth";
import { useEnsureSiweSession } from "@/hooks/useEnsureSiweSession";

export default function DelegateStatementForm({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const router = useRouter();
  const { ui } = Tenant.current();
  const { address, chain } = useAccount();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
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

      if (!connectedAddress) {
        throw new Error("Wallet not connected.");
      }

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
    } catch (error) {
      console.error(error);
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Failed to authenticate. Please try again."
      );
      return;
    }
  }

  const canSubmit =
    !!address &&
    !isSiweSigningIn &&
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
