"use client";

import { useEffect, useState } from "react";
import { fetchDelegateStatement } from "@/app/delegates/actions";
import { DelegateStatement } from "@/app/api/common/delegateStatement/delegateStatement";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Tenant from "@/lib/tenant/tenant";
import AgoraLoader, {
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import DelegateStatementForm from "@/components/DelegateStatement/DelegateStatementForm";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import Link from "next/link";
import { BackArrowIcon } from "@/icons/BackArrow";
import { useSearchParams } from "next/navigation";
import { useGetDelegateDraftStatement } from "@/hooks/useGetDelegateDraftStatement";

const { slug: daoSlug } = Tenant.current();

export type DelegateStatementFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  agreeCodeConduct: z.boolean(),
  agreeDaoPrinciples: z.boolean(),
  daoSlug: z.string(),
  delegateStatement: z.string(),
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
  discord: z.string().optional(),
  email: z.string().optional(),
  twitter: z.string().optional(),
  warpcast: z.string().optional(),
  notificationPreferences: z
    .object({
      wants_proposal_created_email: z.union([
        z.boolean(),
        z.literal("prompt"),
        z.literal("prompted"),
      ]),
      wants_proposal_ending_soon_email: z.union([
        z.boolean(),
        z.literal("prompt"),
        z.literal("prompted"),
      ]),
    })
    .optional(),
});

export default function CurrentDelegateStatement() {
  const { ui } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;
  const { selectedWalletAddress: address } = useSelectedWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatement | null>(null);
  const searchParams = useSearchParams();
  const draftView = searchParams?.get("draftView") === "true";
  const { data: delegateStatementDraft } =
    useGetDelegateDraftStatement(address);
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
      delegateStatement:
        (delegateStatement?.payload as { delegateStatement?: string })
          ?.delegateStatement || "",
      scwAddress: delegateStatement?.scw_address || "",
      topIssues:
        (
          delegateStatement?.payload as {
            topIssues: {
              value: string;
              type: string;
            }[];
          }
        )?.topIssues?.length > 0
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
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: setDefaultValues(delegateStatement),
    mode: "onChange",
    disabled: draftView || !!delegateStatementDraft,
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

    if (address && !draftView) {
      setLoading(true);
      _getDelegateStatement();
    } else if (address && draftView) {
      setDelegateStatement(delegateStatementDraft as DelegateStatement);
      reset(setDefaultValues(delegateStatementDraft as DelegateStatement));
      setLoading(false);
    }
  }, [address, reset, draftView, delegateStatementDraft]);

  return loading ? (
    shouldHideAgoraBranding ? (
      <LogoLoader />
    ) : (
      <AgoraLoader />
    )
  ) : (
    <>
      <div className="flex items-center">
        <Link
          className="cursor-pointer border border-line rounded-full w-10 h-10 flex items-center justify-center mt-6 mb-6"
          href={`/delegates/${address}`}
        >
          <BackArrowIcon className="h-6 w-6 stroke-primary" />
        </Link>
        <span className="text-primary font-bold pl-3">Back</span>
      </div>
      <DelegateStatementForm
        form={form}
        canEdit={!draftView && !delegateStatementDraft}
      />
    </>
  );
}
