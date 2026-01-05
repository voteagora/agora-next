"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { fetchDelegateStatement } from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import { DelegateStatement } from "@/app/api/common/delegateStatement/delegateStatement";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Tenant from "@/lib/tenant/tenant";
import AgoraLoader, {
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import DelegateStatementForm from "@/components/DelegateStatement/DelegateStatementForm";

const { slug: daoSlug } = Tenant.current();

export type DelegateStatementFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  agreeCodeConduct: z.boolean(),
  agreeDaoPrinciples: z.boolean(),
  daoSlug: z.string(),
  discord: z.string(),
  delegateStatement: z.string(),
  email: z.string(),
  twitter: z.string(),
  warpcast: z.string(),
  scwAddress: z.string().optional(),
  topIssues: z.array(
    z
      .object({
        type: z.string(),
        value: z.string(),
      })
      .strict()
  ),
  topStakeholders: z.array(
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
  const shouldHideAgoraBranding = ui.hideAgoraBranding;
  const { address, isConnected, isConnecting } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatement | null>(null);

  // Display the first two delegate issues as default values
  const topIssues = ui.governanceIssues;
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
  const requireDaoPrinciples = !!ui.toggle("delegates/dao-principles")?.enabled;

  const setDefaultValues = (delegateStatement: DelegateStatement | null) => {
    return {
      agreeCodeConduct: !requireCodeOfConduct,
      agreeDaoPrinciples: !requireDaoPrinciples,
      daoSlug,
      discord: delegateStatement?.discord || "",
      delegateStatement:
        (delegateStatement?.payload as { delegateStatement?: string })
          ?.delegateStatement || "",
      email: "",
      twitter: delegateStatement?.twitter || "",
      warpcast: delegateStatement?.warpcast || "",
      scwAddress: delegateStatement?.scw_address || "",
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

      topStakeholders:
        (
          delegateStatement?.payload as {
            topStakeholders: {
              value: string;
              type: string;
            }[];
          }
        )?.topStakeholders?.length > 0
          ? (
              delegateStatement?.payload as {
                topStakeholders: {
                  value: string;
                  type: string;
                }[];
              }
            )?.topStakeholders
          : [],

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
    mode: "onChange",
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

  if (!isConnected && !isConnecting) {
    return <ResourceNotFound message="Oops! Nothing's here" />;
  }

  return loading ? (
    shouldHideAgoraBranding ? (
      <LogoLoader />
    ) : (
      <AgoraLoader />
    )
  ) : (
    <DelegateStatementForm form={form} />
  );
}
