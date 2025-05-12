"use client";

import DelegateCardList from "./DelegateCardList";
import DelegateTable from "./DelegateTable";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useQueryState, parseAsString } from "nuqs";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { trackEvent } from "@/lib/analytics";
import { TENANT_NAMESPACES } from "@/lib/constants";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (
    pagination: PaginationParams,
    seed?: number
  ) => Promise<PaginatedResult<DelegateChunk[]>>;
}

export default function DelegateContent({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const [layout] = useQueryState("layout", parseAsString.withDefault("grid"));
  const { address } = useAccount();
  const [showDialog, setShowDialog] = useState(false);
  const openDialog = useOpenDialog();
  const { ui, namespace } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!address && !showDialog && isDelegationEncouragementEnabled) {
        openDialog({
          type: "ENCOURAGE_CONNECT_WALLET",
          params: {},
        });
        setShowDialog(true);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [address, showDialog, openDialog]);

  useEffect(() => {
    if (address && namespace === TENANT_NAMESPACES.OPTIMISM) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.DELEGATE_PAGE_VIEW_WITH_WALLET,
        event_data: {
          address,
        },
      });
    }
  }, [address, namespace]);

  return layout === "grid" ? (
    <DelegateCardList
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
    />
  ) : (
    <DelegateTable
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
    />
  );
}
