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
import { useEffect, useState } from "react";
import {
  fetchDelegate,
  submitDelegateStatement,
} from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

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
    z.object({
      type: z.string(),
      value: z.string(),
    })
  ),
  openToSponsoringProposals: z.boolean().nullable(),
  mostValuableProposals: z.array(z.unknown()),
  leastValuableProposals: z.array(z.unknown()),
});

export type DelegateStatementFormValues = z.infer<typeof formSchema>;

// TODO: frh -> on create and edit fill with current data from dynamodb or postgresql if it exists
// TODO: frh -> what if delegateStatement is empty check postgresql and check required fields
export default function DelegateStatementForm() {
  const { address, isConnected } = useAccount();
  const walletClient = useWalletClient();
  const messageSigner = useSignMessage();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreeCodeConduct: false,
      daoSlug,
      discord: "",
      delegateStatement: "",
      email: "",
      twitter: "",
      topIssues: initialTopIssues(),
      openToSponsoringProposals: null,
      mostValuableProposals: [],
      leastValuableProposals: [],
    },
  });
  const agreeCodeConduct = useWatch({
    control: form.control,
    name: "agreeCodeConduct",
  });
  const openDialog = useOpenDialog();

  useEffect(() => {
    async function _getDelegate() {
      const _delegate = await fetchDelegate(address as string);
      setDelegate(_delegate);
    }
    if (address) {
      _getDelegate();
    }
  }, [address]);

  if (!isConnected) {
    return <ResourceNotFound message="Oops! Nothing's here" />;
  }

  async function onSubmit(values: DelegateStatementFormValues) {
    if (!agreeCodeConduct) {
      return;
    }
    if (!walletClient) {
      throw new Error("signer not available");
    }

    const serializedBody = JSON.stringify(values, undefined, "\t");
    const signature = await messageSigner.signMessageAsync({
      message: serializedBody,
    });

    if (signature) {
      // TODO: what should content of dialog be
      submitDelegateStatement(address as string, values, signature)
        .then(() => {
          openDialog({
            type: "DELEGATE_STATEMENT",
            params: {},
          });
        })
        .catch((error) => {
          if (error.message) {
            setSubmissionError(error.message);
            return;
          }
        });
    }
  }

  const canSubmit =
    !!walletClient &&
    // TODO: pending when backend ready
    // !isMutationInFlight &&
    // !submitMutation.isLoading &&
    form.formState.isDirty;

  return (
    <div className="flex flex-col xl:flex-row-reverse items-center xl:items-start gap-16 justify-between mt-12 w-full max-w-full">
      {delegate && (
        <VStack className="static xl:sticky top-16 shrink-0 w-full xl:max-w-xs">
          <DelegateCard delegate={delegate} />
        </VStack>
      )}
      <VStack className="w-full">
        <VStack className="bg-white border radius-xl border-gray-300 shadow-newDefault">
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
        {/* TODO: see how to get if an address is a Safe Wallet */}
        {/* {delegate?.address?.isContract && (
          <VStack className="my-6 mx-0 py-8 px-6 bg-white rounded-xl border border-gray-300 shadow-newDefault">
            <span className="text-sm">
              Instructions to sign with a Gnosis Safe wallet
            </span>
            <VStack className="text-[#66676b] text-xs">
              <span>1. Submit a delegate statement</span>
              <span>
                2. Wait for all required signers to approve the Safe transaction
              </span>
              <span>
                3. Resubmit the delegate statement. It will confirm without
                requiring approvals since it has already been signed.
              </span>
            </VStack>
          </VStack>
        )} */}
      </VStack>
    </div>
  );
}
