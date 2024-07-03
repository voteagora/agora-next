"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { fetchDelegateStatement } from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementForm from "./DelegateStatementForm";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import { DelegateStatement } from "@/app/api/common/delegateStatement/delegateStatement";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Tenant from "@/lib/tenant/tenant";

const { slug: daoSlug } = Tenant.current();

export type DelegateStatementFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  agreeCodeConduct: z.boolean(),
  daoSlug: z.string(),
  discord: z.string(),
  delegateStatement: z.string(),
  email: z.string(),
  twitter: z.string(),
  warpcast: z.string(),
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
  const { ui } = Tenant.current();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatement | null>(null);

  // Display the first two delegate issues as default values
  const topIssues = ui.topGovernanceIssues;
  const defaultIssues = !topIssues
    ? []
    : topIssues.slice(0, 2).map((issue) => {
        return {
          type: issue.key,
          value: "",
        };
      });

  const requireCodeOfConduct = !!ui.toggle("delegates/code-of-conduct")
    ?.enabled;

  const setDefaultValues = (delegateStatement: DelegateStatement | null) => {
    return {
      agreeCodeConduct: !requireCodeOfConduct,
      daoSlug,
      discord: delegateStatement?.discord || "",
      delegateStatement:
        (delegateStatement?.payload as { delegateStatement?: string })
          ?.delegateStatement || "",
      email: delegateStatement?.email || "",
      twitter: delegateStatement?.twitter || "",
      warpcast: delegateStatement?.warpcast || "",
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
          : defaultIssues,
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
