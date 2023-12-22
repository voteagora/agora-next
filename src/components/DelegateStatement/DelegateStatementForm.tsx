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
import { useAccount, useWalletClient } from "wagmi";
import { Delegate } from "@/app/api/delegates/delegate";
import { useEffect, useState } from "react";
import { fetchDelegate } from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

const formSchema = z.object({
  agreeCodeConduct: z.boolean(),
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
});

export type FormValues = z.infer<typeof formSchema>;

export default function DelegateStatementForm() {
  const { address, isConnected } = useAccount();
  const walletClient = useWalletClient();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreeCodeConduct: false,
      discord: "",
      delegateStatement: "",
      email: "",
      twitter: "",
      topIssues: initialTopIssues(),
    },
  });
  const agreeCodeConduct = useWatch({
    control: form.control,
    name: "agreeCodeConduct",
  });
  const openDialog = useOpenDialog();

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (agreeCodeConduct) {
      console.log("values", values);
      openDialog({
        type: "DELEGATE_STATEMENT",
        params: {},
      });
    }
  }

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
