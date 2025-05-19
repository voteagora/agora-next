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
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useDelegate } from "@/hooks/useDelegate";
import DelegateDetailsForm from "./DelegateDetailsForm";
import { useGetDelegateDraftStatement } from "@/hooks/useGetDelegateDraftStatement";

const { slug: daoSlug } = Tenant.current();

export type DelegateDetailsFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  daoSlug: z.string(),
  discord: z.string(),
  email: z.string(),
  twitter: z.string(),
  warpcast: z.string(),
  notificationPreferences: z.object({
    last_updated: z.string().optional(),
    wants_proposal_created_email: z.union([
      z.literal("prompt"),
      z.literal("prompted"),
      z.boolean(),
    ]),
    wants_proposal_ending_soon_email: z.union([
      z.literal("prompt"),
      z.literal("prompted"),
      z.boolean(),
    ]),
  }),
});

export default function DelegateDetailsPage() {
  const { ui } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;
  const { selectedWalletAddress: address } = useSelectedWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatement | null>(null);
  const { data: delegate } = useDelegate({ address });
  const { data: draftStatement } = useGetDelegateDraftStatement(address);

  const setDefaultValues = (delegateStatement: DelegateStatement | null) => {
    return {
      daoSlug,
      discord: delegateStatement?.discord || "",
      email: delegateStatement?.email || "",
      twitter: delegateStatement?.twitter || "",
      warpcast: delegateStatement?.warpcast || "",
      notificationPreferences: (delegateStatement?.notification_preferences as {
        wants_proposal_created_email: "prompt" | "prompted" | boolean;
        wants_proposal_ending_soon_email: "prompt" | "prompted" | boolean;
      }) || {
        wants_proposal_created_email: "prompt",
        wants_proposal_ending_soon_email: "prompt",
      },
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: setDefaultValues(delegateStatement),
    mode: "onChange",
    disabled: !address,
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

  return loading ? (
    shouldHideAgoraBranding ? (
      <LogoLoader />
    ) : (
      <AgoraLoader />
    )
  ) : (
    <DelegateDetailsForm
      form={form}
      delegate={delegate}
      canEdit={!draftStatement}
    />
  );
}
