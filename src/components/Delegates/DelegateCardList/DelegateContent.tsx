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

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  banner?: React.ReactNode;
  fetchDelegates: (args: {
    pagination?: PaginationParams;
    seed?: number;
    showParticipation?: boolean;
  }) => Promise<PaginatedResult<DelegateChunk[]>>;
}

export default function DelegateContent({
  initialDelegates,
  banner,
  fetchDelegates,
}: Props) {
  const { ui } = Tenant.current();
  const delegatesLayout = ui.toggle("delegates-layout-list")?.enabled
    ? "list"
    : "grid";
  const [layout] = useQueryState(
    "layout",
    parseAsString.withDefault(delegatesLayout)
  );
  const { address } = useAccount();
  const [showDialog, setShowDialog] = useState(false);
  const openDialog = useOpenDialog();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if we've already shown the dialog this session
      const hasShownDialogThisSession =
        sessionStorage.getItem("agora-delegation-dialog-shown") === "true";

      if (
        !address &&
        !hasShownDialogThisSession &&
        !showDialog &&
        isDelegationEncouragementEnabled
      ) {
        openDialog({
          type: "ENCOURAGE_CONNECT_WALLET",
          params: {},
        });
        setShowDialog(true);
        // Mark that we've shown the dialog this session
        sessionStorage.setItem("agora-delegation-dialog-shown", "true");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [address, showDialog, openDialog, isDelegationEncouragementEnabled]);

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

  return layout === "grid" ? (
    <DelegateCardList
      initialDelegates={initialDelegates}
      banner={banner}
      fetchDelegates={fetchDelegates}
    />
  ) : (
    <DelegateTable
      initialDelegates={initialDelegates}
      banner={banner}
      fetchDelegates={fetchDelegates}
    />
  );
}
