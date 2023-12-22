"use client";

import { VStack } from "@/components/Layout/Stack";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import OtherInfoFormSection from "./OtherInfoFormSection";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { initialTopIssues } from "./TopIssuesFormSection";
import { useAccount } from "wagmi";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { Delegate } from "@/app/api/delegates/delegate";
import { useEffect, useState } from "react";

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
  // TODO: frh gnosis connection and what if no address
  const { address } = useAccount();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discord: "",
      delegateStatement: "",
      email: "",
      twitter: "",
      topIssues: initialTopIssues(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values", values);
  }

  useEffect(() => {
    async function _getDelegate() {
      const _delegate = await getDelegate({
        addressOrENSName: address as `0x${string}`,
      });
      setDelegate(_delegate);
    }
    if (address) {
      _getDelegate();
    }
  }, [address]);

  return (
    <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6 justify-between mt-12 w-full max-w-full">
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
                  // TODO: frh -> canSubmit
                  // disabled={!canSubmit}
                  type="submit"
                >
                  Submit delegate profile
                </Button>
                {/* {lastErrorMessage && (
            <span className="text-sm text-red-700">{lastErrorMessage}</span>
          )} */}
              </div>
            </form>
          </Form>
        </VStack>
      </VStack>
      {delegate && (
        <VStack className="static xl:sticky top-16 shrink-0 w-full xl:max-w-xs">
          <DelegateCard delegate={delegate} />
        </VStack>
      )}
    </div>
  );
}

// TODO: gnosis connection and check older file
// {data?.delegate?.address?.isContract && (
//   <VStack
//     className={css`
//       margin: ${theme.spacing["6"]} 0;
//       padding: ${theme.spacing["8"]} ${theme.spacing["6"]};

//       ${containerStyle};
//     `}
//   >
//     <span
//       className={css`
//         font-size: ${theme.fontSize.sm};
//       `}
//     >
//       Instructions to sign with a Gnosis Safe wallet
//     </span>
//     <VStack
//       className={css`
//         color: #66676b;
//         font-size: ${theme.fontSize.xs};
//       `}
//     >
//       <span>1. Submit a delegate statement</span>
//       <span>
//         2. Wait for all required signers to approve the Safe transaction
//       </span>
//       <span>
//         3. Resubmit the delegate statement. It will confirm without
//         requiring approvals since it has already been signed.
//       </span>
//     </VStack>
//   </VStack>
// )}
