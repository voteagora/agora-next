"use client";

import { VStack } from "@/components/Layout/Stack";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import OtherInfoFormSection from "./OtherInfoFormSection";
import { Button } from "@/components/ui/button";
// TODO: frh -> this useForm or the other one
import { useForm } from "@/app/lib/hooks/useForm";

export default function DelegateStatementForm() {
  // TODO: frh wallet connection and gnosis connection
  // TODO: real data on this form and rest of fiels
  const form = useForm({
    discord: "agora",
    twitter: "agora",
    // leastValuableProposals
    //mostValuableProposals
    topIssues: [
      {
        type: "treasury",
        value: "fake",
      },
      {
        type: "funding",
        value: "fake",
      },
      {
        type: "publicGoods",
        value: "fake",
      },
    ],
  });

  return (
    <VStack className="w-full">
      <VStack className="bg-white border radius-xl border-gray-300 shadow-newDefault">
        <DelegateStatementFormSection form={form} />
        <TopIssuesFormSection form={form} />
        <OtherInfoFormSection form={form} />

        <div className="flex flex-col lg:flex-row justify-end lg:justify-between items-stretch lg:items-center gap-4 py-8 px-6 flex-wrap">
          <span className="text-sm text-gray-800">
            Tip: you can always come back and edit your profile at any time.
          </span>

          <Button
            variant="elevatedOutline"
            className="py-3 px-4"
            // className={buttonStyles}
            // disabled={!canSubmit}
            // onClick={() =>
            //   submitMutation.mutate({
            //     values: form.state,
            //     address,
            //   })
            // }
          >
            Submit delegate profile
          </Button>
          {/* {lastErrorMessage && (
            <span className="text-sm text-red-700">{lastErrorMessage}</span>
          )} */}
        </div>
      </VStack>
    </VStack>
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
