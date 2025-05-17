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
import { fetchDelegatesServerAction } from "./delegateActions";
import { DelegateFilters } from "./delegateUtils";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  sort: string;
  filters: DelegateFilters;
}

export default function DelegateContent({
  initialDelegates,
  sort,
  filters,
}: Props) {
  const [layout] = useQueryState("layout", parseAsString.withDefault("grid"));
  const { address } = useAccount();
  const [showDialog, setShowDialog] = useState(false);
  const openDialog = useOpenDialog();
  const { ui } = Tenant.current();
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
    if (address) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.DELEGATE_PAGE_VIEW_WITH_WALLET,
        event_data: {
          address,
        },
      });
    }
  }, [address]);

  // Create a wrapper function that uses the server action
  const fetchDelegatesWrapper = async (
    pagination: PaginationParams,
    seed: number
  ) => {
    return fetchDelegatesServerAction(pagination, seed, sort, filters);
  };

  return layout === "grid" ? (
    <DelegateCardList
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegatesWrapper}
    />
  ) : (
    <DelegateTable
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegatesWrapper}
    />
  );
}
