"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { fetchDelegateStatement } from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementForm from "./DelegateStatementForm";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import { type DelegateStatement } from "@/app/api/delegateStatement/delegateStatement";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { initialTopIssues } from "@/components/DelegateStatement/TopIssuesFormSection";
import { DaoSlug } from "@prisma/client";

const daoSlug = process.env.NEXT_PUBLIC_AGORA_INSTANCE_TOKEN;
if (!(daoSlug && daoSlug in DaoSlug)) {
  throw new Error("Can't find Agora Instance token");
}

export type DelegateStatementFormValues = z.infer<typeof formSchema>;

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

export default function CurrentDelegateStatement() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatement | null>(null);
  const setDefaultValues = (delegateStatement: DelegateStatement | null) => {
    return {
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
        )?.topIssues.length > 0
          ? (
              delegateStatement?.payload as {
                topIssues: {
                  value: string;
                  type: string;
                }[];
              }
            )?.topIssues
          : initialTopIssues(),
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
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: setDefaultValues(delegateStatement),
  });
  const { reset } = form;

  useEffect(() => {
    async function _getDelegateStatement() {
      const _delegateStatement = await fetchDelegateStatement(
        address as string
      ).catch((error) => console.error(error));
      setDelegateStatement(_delegateStatement as DelegateStatement);
      reset(setDefaultValues(_delegateStatement as DelegateStatement));
      setLoading(false);
    }
    if (address) {
      setLoading(true);
      _getDelegateStatement();
    }
  }, [address, reset]);

  if (!isConnected) {
    return <ResourceNotFound message="Oops! Nothing's here" />;
  }

  return loading ? <AgoraLoader /> : <DelegateStatementForm form={form} />;
}
