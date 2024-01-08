"use client";

import { VStack } from "@/components/Layout/Stack";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import OtherInfoFormSection from "./OtherInfoFormSection";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWatch, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { initialTopIssues } from "./TopIssuesFormSection";
import { useAccount, useWalletClient, useSignMessage } from "wagmi";
import { Delegate } from "@/app/api/delegates/delegate";
import { DaoSlug } from "@prisma/client";
import {
  fetchDelegate,
  submitDelegateStatement,
} from "@/app/delegates/actions";
import { useEffect, useState } from "react";
import { type DelegateStatement } from "@/app/api/delegateStatement/delegateStatement";
import { useRouter } from "next/navigation";

const daoSlug = process.env.NEXT_PUBLIC_AGORA_INSTANCE_TOKEN;
if (!(daoSlug && daoSlug in DaoSlug)) {
  throw new Error("Can't find Agora Instance token");
}

const formSchema = z.object({
  agreeCodeConduct: z.boolean(),
  daoSlug: z.string(),
  discord: z.string(),
  delegateStatement: z.string(),
  email: z.string(),
  twitter: z.string(),
  topIssues: z.array(
    z
      .object({
        type: z.string(),
        value: z.string(),
      })
      .strict()
  ),
  openToSponsoringProposals: z.union([
    z.literal("yes"),
    z.literal("no"),
    z.null(),
  ]),
  mostValuableProposals: z.array(
    z
      .object({
        number: z.string(),
      })
      .strict()
  ),
  leastValuableProposals: z.array(
    z
      .object({
        number: z.string(),
      })
      .strict()
  ),
});

export type DelegateStatementFormValues = z.infer<typeof formSchema>;

export default function DelegateStatementForm({
  delegateStatement,
}: {
  delegateStatement: DelegateStatement | null;
}) {
  const router = useRouter();
  const { address } = useAccount();
  const walletClient = useWalletClient();
  const messageSigner = useSignMessage();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreeCodeConduct: false,
      daoSlug,
      discord: delegateStatement?.discord || "",
      delegateStatement:
        (delegateStatement?.payload as { delegateStatement?: string })
          ?.delegateStatement || "",
      email: delegateStatement?.email || "",
      twitter: delegateStatement?.twitter || "",
      topIssues:
        (
          delegateStatement?.payload as {
            topIssues: {
              value: string;
              type: string;
            }[];
          }
        )?.topIssues || initialTopIssues(),
      openToSponsoringProposals:
        (
          delegateStatement?.payload as {
            openToSponsoringProposals?: "yes" | "no" | null;
          }
        )?.openToSponsoringProposals || null,
      mostValuableProposals:
        (delegateStatement?.payload as { mostValuableProposals?: object[] })
          ?.mostValuableProposals || [],
      leastValuableProposals:
        (delegateStatement?.payload as { leastValuableProposals?: object[] })
          ?.leastValuableProposals || [],
    },
  });
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

    const serializedBody = JSON.stringify(values, undefined, "\t");
    const signature = await messageSigner
      .signMessageAsync({
        message: serializedBody,
      })
      .catch((error) => console.error(error));

    if (!signature) {
      setSubmissionError("Signature failed, please try again");
      return;
    }

    const response = await submitDelegateStatement(
      address as string,
      values,
      signature
    ).catch((error) => console.error(error));

    if (!response) {
      setSubmissionError(
        "There was an error submitting your form, please try again"
      );
      return;
    }

    router.push(`/delegates/${address}`);
  }

  const canSubmit =
    !!walletClient && !form.formState.isSubmitting && !!form.formState.isValid;

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
